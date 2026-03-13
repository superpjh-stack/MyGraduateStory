import { getProfile } from "@/lib/actions/profile";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const res = await getProfile();
  const profile = (res.data ?? {}) as any;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">설정</h1>
        <p className="text-sm text-muted-foreground mt-0.5">프로필과 학기를 설정하세요</p>
      </div>
      <SettingsForm profile={profile} email={res.email} />
    </div>
  );
}
