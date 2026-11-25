import { Select } from "@/components/ui/primitives";

export function ClassSelect({ classes }: { classes: { id: string; name: string }[] }) {
  return (
    <Select label="For" name="classId" defaultValue="">
      <option value="">The whole club</option>
      {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
    </Select>
  );
}
