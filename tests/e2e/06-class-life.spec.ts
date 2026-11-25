import { expect, test, type Page } from "@playwright/test";
import { addTeacher, createActiveOrg, kidSignIn, registerViaClubhouse, signIn, signOut } from "./helpers";

async function newKid(page: Page, slug: string, code: string, name: string, pin: number[]) {
  const parent = await registerViaClubhouse(page, slug, code, name, pin);
  const username = await page.getByTestId("new-username").innerText();
  await signOut(page);
  return { parent, username };
}

test("Talk to Someone: anonymous concern, urgent alert, reply, escalation", async ({ page }) => {
  const org = await createActiveOrg();
  const { username } = await newKid(page, org.slug, org.joinCode, "Ada", [0, 1, 2, 3]);

  await kidSignIn(page, org.slug, username, [0, 1, 2, 3]);
  await page.getByTestId("talk-tile").click();
  await page.getByLabel("What would you like to tell us?").fill("Someone at school is being mean to me");
  await page.getByLabel(/Don.t show my name/).check();
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByRole("status")).toContainText("You did the right thing");
  await expect(page.getByTestId("my-concerns")).toContainText("being mean to me");
  await signOut(page);

  await signIn(page, org.owner.email);
  await expect(page.getByTestId("bell")).not.toHaveAttribute("data-urgent", "0");
  await page.goto(`/o/${org.slug}/talk`);
  const list = page.getByTestId("concern-list");
  await expect(list).toContainText("Anonymous");
  await expect(list).not.toContainText("Ada");
  await expect(list).not.toContainText(username);
  await list.getByRole("link", { name: "Anonymous" }).click();
  await expect(page.getByTestId("concern-body")).toContainText("being mean to me");
  await expect(page.locator("main")).not.toContainText(username);
  await page.getByLabel("Reply to the child").fill("Thank you for telling us. We are here for you.");
  await page.getByRole("button", { name: "Send reply" }).click();
  await expect(page.getByTestId("concern-replies")).toContainText("We are here for you");
  await page.getByLabel("Set status").selectOption("escalated");
  await page.getByRole("button", { name: "Update" }).click();
  await expect(page.getByTestId("concern-status")).toHaveText("escalated");
  await signOut(page);

  await kidSignIn(page, org.slug, username, [0, 1, 2, 3]);
  await page.goto(`/k/${org.slug}/talk`);
  const mine = page.getByTestId("my-concerns");
  await expect(mine).toContainText("A trusted adult");
  await expect(mine).toContainText("We are here for you");
  await mine.getByLabel("Write back").fill("Thank you");
  await mine.getByRole("button", { name: "Send" }).click();
  await expect(mine).toContainText("Thank you");
});

test("Messages: locked for new kids, open once confirmed, teacher replies", async ({ page }) => {
  const org = await createActiveOrg();
  const teacher = await addTeacher(org.id);
  const { username } = await newKid(page, org.slug, org.joinCode, "Bola", [4, 5, 6, 7]);

  await kidSignIn(page, org.slug, username, [4, 5, 6, 7]);
  await page.goto(`/k/${org.slug}/messages`);
  await expect(page.getByTestId("messages-locked")).toBeVisible();
  await signOut(page);

  await signIn(page, teacher.email);
  await page.getByTestId(`kid-${username}`).getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByTestId(`kid-${username}`).getByText("Confirmed")).toBeVisible();
  await signOut(page);

  await kidSignIn(page, org.slug, username, [4, 5, 6, 7]);
  await page.goto(`/k/${org.slug}/messages`);
  await page.getByLabel("Message").fill("Hello teacher, I loved today");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByTestId("kid-thread")).toContainText("I loved today");
  await signOut(page);

  await signIn(page, teacher.email);
  await page.goto(`/o/${org.slug}/messages`);
  await page.getByRole("link", { name: /Bola/ }).first().click();
  await expect(page.getByTestId("thread")).toContainText("I loved today");
  await page.getByLabel("Message").fill("So glad, see you Sunday");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByTestId("thread")).toContainText("see you Sunday");
  await signOut(page);

  await kidSignIn(page, org.slug, username, [4, 5, 6, 7]);
  await page.goto(`/k/${org.slug}/messages`);
  await expect(page.getByTestId("kid-thread")).toContainText("see you Sunday");
});

test("Class: lesson and assignment, kid hands in, teacher marks, points; events reach the parent", async ({ page }) => {
  const org = await createActiveOrg();
  const teacher = await addTeacher(org.id);
  const { parent, username } = await newKid(page, org.slug, org.joinCode, "Chidi", [8, 9, 10, 11]);

  await signIn(page, teacher.email);
  await page.goto(`/o/${org.slug}/lessons`);
  await page.getByLabel("Title").fill("Being brave");
  await page.getByLabel("What kids will read").fill("Brave people still feel scared.");
  await page.getByLabel("Publish now so kids can see it").check();
  await page.getByRole("button", { name: "Save lesson" }).click();
  await expect(page.getByTestId("lesson-list")).toContainText("Being brave");

  await page.goto(`/o/${org.slug}/assignments`);
  await page.getByLabel("Title").fill("Draw a brave moment");
  await page.getByLabel("Instructions").fill("Tell us about a time you were brave.");
  await page.getByLabel("Publish now and tell the kids").check();
  await page.getByRole("button", { name: "Save assignment" }).click();
  await expect(page.getByTestId("assignment-list")).toContainText("Draw a brave moment");
  await signOut(page);

  await signIn(page, org.owner.email);
  await page.goto(`/o/${org.slug}/events`);
  await page.getByLabel("Title").fill("Family fun day");
  await page.getByLabel(/^Starts/).fill("2031-06-14T10:00");
  await page.getByLabel("Where (optional)").fill("Main hall");
  await page.getByRole("button", { name: "Add event" }).click();
  await expect(page.getByTestId("event-list")).toContainText("Family fun day");
  await signOut(page);

  await kidSignIn(page, org.slug, username, [8, 9, 10, 11]);
  await expect(page.getByTestId("bell")).not.toHaveAttribute("data-unread", "0");
  await page.goto(`/k/${org.slug}/class`);
  await expect(page.getByTestId("kid-lessons")).toContainText("Being brave");
  await page.getByLabel("Your answer").fill("I sang in front of everyone");
  await page.getByRole("button", { name: "Hand it in" }).click();
  await expect(page.getByRole("status")).toBeVisible();
  await page.goto(`/k/${org.slug}/home`);
  await expect(page.getByTestId("kid-points")).toHaveText("15 Champ Points");
  await page.goto(`/k/${org.slug}/events`);
  await expect(page.getByTestId("kid-events")).toContainText("Family fun day");
  await signOut(page);

  await signIn(page, teacher.email);
  await page.goto(`/o/${org.slug}/assignments`);
  await page.getByTestId("assignment-list").getByRole("link", { name: "Draw a brave moment" }).click();
  await expect(page.getByTestId("submission-list")).toContainText("I sang in front of everyone");
  await page.getByLabel("Mark /100").fill("95");
  await page.getByLabel("Feedback").fill("So brave!");
  await page.getByRole("button", { name: "Save mark" }).click();
  await expect(page.getByRole("status")).toBeVisible();
  await signOut(page);

  await kidSignIn(page, org.slug, username, [8, 9, 10, 11]);
  await page.goto(`/k/${org.slug}/class`);
  await expect(page.getByTestId("kid-grade")).toContainText("95/100");
  await signOut(page);

  await signIn(page, parent.email);
  await expect(page.getByTestId("parent-events")).toContainText("Family fun day");
  const ics = await page.request.get("/p/calendar");
  expect(ics.status()).toBe(200);
  expect(ics.headers()["content-type"]).toContain("text/calendar");
  const body = await ics.text();
  expect(body).toContain("SUMMARY:Family fun day");
  expect(body).toContain("LOCATION:Main hall");
});
