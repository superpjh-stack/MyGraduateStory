import { getCapsules } from "@/lib/actions/capsule";
import { CapsuleForm } from "@/components/capsule/capsule-form";
import { CapsuleList } from "@/components/capsule/capsule-list";

export default async function CapsulePage() {
  const res = await getCapsules();
  const capsules = (res.data ?? []) as any[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">타임캡슐 ⏳</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          미래의 나에게 편지를 보내세요
        </p>
      </div>

      <CapsuleForm />

      <CapsuleList capsules={capsules} />
    </div>
  );
}
