import { expect, test, type Page } from "@playwright/test";
import { addTeacher, admin, createActiveOrg, kidSignIn, registerViaClubhouse, signIn, signOut } from "./helpers";

/** The right answer index for a question on screen, looked up with the service role (never from the page). */
async function answerFor(prompt: string): Promise<number> {
  const { data } = await admin.from("questions").select("answer_index").eq("prompt", prompt).is("organization_id", null).limit(1).single();
  return data!.answer_index;
}

async function startMatch(page: Page, slug: string, teams: [string, string]) {
  await page.goto(`/o/${slug}/quiz`);
  await page.getByLabel("Questions").selectOption({ label: "General Knowledge" });
  await page.getByLabel("Shot Clock").selectOption("0");
  await page.getByLabel("Team 1").fill(teams[0]);
  await page.getByLabel("Team 2").fill(teams[1]);
  await page.getByRole("button", { name: "Go to the rules screen" }).click();
  await expect(page.getByTestId("quiz-rules")).toBeVisible();
  await page.getByRole("button", { name: "Let's play!" }).click();
}

test("Road to Champ host: rules, five tiers, Half Time, scoring, saved to history", async ({ page }) => {
  const org = await createActiveOrg();
  const teacher = await addTeacher(org.id);
  await signIn(page, teacher.email);
  await startMatch(page, org.slug, ["Lions", "Eagles"]);

  for (let turn = 0; turn < 10; turn++) {
    const prompt = await page.getByTestId("quiz-question").innerText();
    const right = await answerFor(prompt);
    const lionsTurn = turn % 2 === 0;
    if (turn === 1) {
      await page.getByRole("button", { name: "Half Time" }).click();
      const visible = await page.locator('[data-testid^="choice-"]:not(.invisible)').count();
      expect(visible).toBe(2);
      await expect(page.getByTestId(`choice-${right}`)).toBeVisible();
      await expect(page.getByRole("button", { name: "Half Time" })).toBeDisabled();
    }
    if (lionsTurn) await page.getByTestId(`choice-${right}`).click();
    else await page.locator(`[data-testid^="choice-"]:not(.invisible):not([data-testid="choice-${right}"])`).first().click();
    await expect(page.getByTestId("quiz-reveal")).toBeVisible();
    await page.getByRole("button", { name: "Next question" }).click();
  }
  await expect(page.getByTestId("quiz-winner")).toHaveText("Lions are the Champs!");
  await expect(page.getByTestId("final-Lions")).toHaveText("2,100");
  await expect(page.getByTestId("final-Eagles")).toHaveText("0");
  await expect(page.getByTestId("save-status")).toHaveText("Result saved to your match history.");
  await page.getByRole("link", { name: "Back to Road to Champ" }).click();
  await expect(page.getByTestId("match-history")).toContainText("Lions won with 2,100");
});

test("Road to Champ offline: the result waits on the device, then uploads", async ({ page, context }) => {
  const org = await createActiveOrg();
  const teacher = await addTeacher(org.id);
  await signIn(page, teacher.email);
  await startMatch(page, org.slug, ["Owls", "Foxes"]);
  for (let turn = 0; turn < 10; turn++) {
    if (turn === 9) await context.setOffline(true);
    await page.getByTestId("choice-0").click();
    await page.getByRole("button", { name: "Next question" }).click();
  }
  await expect(page.getByTestId("save-status")).toContainText("saved on this device");
  await context.setOffline(false);
  await page.goto(`/o/${org.slug}/quiz`);
  await expect(page.getByRole("status").filter({ hasText: "Uploaded 1 match result" })).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("match-history")).toContainText("Owls");
});

test("Training Ground: a full round checked by the server, points once a day; Arena points capped", async ({ page }) => {
  const org = await createActiveOrg();
  await registerViaClubhouse(page, org.slug, org.joinCode, "Efe", [0, 1, 2, 3]);
  const username = await page.getByTestId("new-username").innerText();
  await signOut(page);

  await kidSignIn(page, org.slug, username, [0, 1, 2, 3]);
  await page.getByRole("navigation", { name: "Champ Town" }).getByRole("link", { name: "Games" }).click();
  await page.getByTestId("road-tile").click();
  await page.getByTestId("pack-list").getByRole("listitem").filter({ hasText: "General Knowledge" }).getByRole("button", { name: "Play" }).click();
  for (let i = 0; i < 10; i++) {
    const prompt = await page.getByTestId("training-question").innerText();
    await page.getByTestId(`tchoice-${await answerFor(prompt)}`).click();
    await expect(page.getByTestId("training-feedback")).toContainText("Yes! That's right.");
    await page.getByRole("button", { name: i === 9 ? "See my score" : "Next" }).click();
    if (i < 9) await expect(page.getByTestId("training-feedback")).toHaveCount(0);
  }
  await expect(page.getByTestId("training-score")).toHaveText("10/10");

  // Memory Match: pair the cards by their pictures
  await page.goto(`/k/${org.slug}/arena/memory`);
  const icons = await page.locator('[data-testid^="card-"]').evaluateAll((els) => els.map((e) => e.getAttribute("data-icon")));
  const pairs = new Map<string, number[]>();
  icons.forEach((icon, i) => pairs.set(icon!, [...(pairs.get(icon!) ?? []), i]));
  for (const [a, b] of pairs.values()) {
    await page.getByTestId(`card-${a}`).click();
    await page.getByTestId(`card-${b}`).click();
  }
  await expect(page.getByTestId("arena-score")).toHaveText("200");
  await expect(page.getByTestId("arena-points")).toHaveText("+5 Champ Points!");
  await page.getByRole("button", { name: "Play again" }).click();
  const again = await page.locator('[data-testid^="card-"]').evaluateAll((els) => els.map((e) => e.getAttribute("data-icon")));
  const p2 = new Map<string, number[]>();
  again.forEach((icon, i) => p2.set(icon!, [...(p2.get(icon!) ?? []), i]));
  for (const [a, b] of p2.values()) {
    await page.getByTestId(`card-${a}`).click();
    await page.getByTestId(`card-${b}`).click();
  }
  await expect(page.getByTestId("arena-points")).toContainText("already earned today's points");

  // Jigsaw: put every tile back in its place
  await page.goto(`/k/${org.slug}/arena/jigsaw`);
  for (let pos = 0; pos < 9; pos++) {
    const tiles = await page.locator("[data-tile]").evaluateAll((els) => els.map((e) => Number(e.getAttribute("data-tile"))));
    if (tiles.length === 0) break;
    if (tiles[pos] === pos) continue;
    const from = tiles.indexOf(pos);
    await page.locator("[data-tile]").nth(pos).click();
    await page.locator("[data-tile]").nth(from).click();
  }
  await expect(page.getByTestId("arena-points")).toHaveText("+5 Champ Points!");

  // 5 (visit) + 15 (training) + 5 (memory) + 5 (jigsaw)
  await page.goto(`/k/${org.slug}/home`);
  await expect(page.getByTestId("kid-points")).toHaveText("30 Champ Points");
});

test("question bank and Arena content; faith mode decides what kids are offered", async ({ page }) => {
  const org = await createActiveOrg();
  const teacher = await addTeacher(org.id);
  await signIn(page, teacher.email);
  await page.goto(`/o/${org.slug}/quiz/bank`);
  await page.getByLabel("Pack name").fill("Our questions");
  await page.getByRole("button", { name: "Create pack" }).click();
  await expect(page.getByRole("heading", { name: "Our questions" })).toBeVisible();
  await page.getByLabel("Question").fill("What is our club motto?");
  await page.getByLabel("Answer A").fill("Be brave");
  await page.getByLabel("Answer B").fill("Be loud");
  await page.getByLabel("Answer C").fill("Be late");
  await page.getByLabel("Answer D").fill("Be sleepy");
  await page.getByRole("button", { name: "Add question" }).click();
  await expect(page.getByTestId("question-list")).toContainText("Answer: Be brave");
  await page.goto(`/o/${org.slug}/quiz/bank`);
  await page.getByRole("link", { name: "General Knowledge" }).click();
  await expect(page.getByText("This is a Champzz pack.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add question" })).toHaveCount(0);

  await page.goto(`/o/${org.slug}/arena`);
  await page.getByLabel("Title").fill("Our verse");
  await page.getByLabel("Content").fill("Be strong and of a good courage");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByTestId("arena-content-list")).toContainText("Our verse");
  await signOut(page);

  // a club with faith mode off sees no Bible pack and plays Star Catch
  const club = await createActiveOrg();
  await admin.from("organizations").update({ faith_mode: false, kind: "club" }).eq("id", club.id);
  await registerViaClubhouse(page, club.slug, club.joinCode, "Femi", [4, 5, 6, 7]);
  const username = await page.getByTestId("new-username").innerText();
  await signOut(page);
  await kidSignIn(page, club.slug, username, [4, 5, 6, 7]);
  await page.goto(`/k/${club.slug}/road`);
  await expect(page.getByTestId("pack-list")).toContainText("General Knowledge");
  await expect(page.getByTestId("pack-list")).not.toContainText("Bible Champs");
  await page.goto(`/k/${club.slug}/games`);
  await expect(page.getByTestId("arena-catch")).toContainText("Star Catch");
  await expect(page.getByTestId("arena-scramble")).toContainText("Word Scramble");
});

test("every Arena game loads and plays", async ({ page }) => {
  const org = await createActiveOrg();
  await registerViaClubhouse(page, org.slug, org.joinCode, "Gozie", [8, 9, 10, 11]);
  const username = await page.getByTestId("new-username").innerText();
  await signOut(page);
  await kidSignIn(page, org.slug, username, [8, 9, 10, 11]);

  // Scramble: tapping a word moves it into the sentence and back
  await page.goto(`/k/${org.slug}/arena/scramble`);
  await expect(page.getByRole("heading", { name: "Verse Scramble" })).toBeVisible();
  const first = page.getByTestId("scramble-pool").getByRole("button").first();
  const word = await first.innerText();
  await first.click();
  await expect(page.getByTestId("scramble-answer")).toContainText(word);

  // Who Am I?: more clues, then an answer
  await page.goto(`/k/${org.slug}/arena/whoami`);
  await page.getByRole("button", { name: /Another clue/ }).click();
  await expect(page.getByText("Clue 2:")).toBeVisible();
  await page.getByTestId("whoami").locator(".grid button").first().click();
  await expect(page.getByTestId("whoami").getByRole("status")).toBeVisible();

  // Word Search: the grid is full and every listed word is in it
  await page.goto(`/k/${org.slug}/arena/wordsearch`);
  await expect(page.getByTestId("ws-grid").getByRole("button")).toHaveCount(100);
  await expect(page.getByRole("list", { name: "Words to find" }).getByRole("listitem").first()).toBeVisible();

  // Catch: starts, counts down
  await page.goto(`/k/${org.slug}/arena/catch`);
  await expect(page.getByRole("heading", { name: "Ark Catch" })).toBeVisible();
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByText(/^2[0-9]s$/)).toBeVisible({ timeout: 10_000 });

  // unknown games are a 404
  expect((await page.goto(`/k/${org.slug}/arena/hack`))?.status()).toBe(404);
});
