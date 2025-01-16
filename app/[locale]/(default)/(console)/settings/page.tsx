export const runtime = 'edge';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getUserInfo } from "@/services/user";
import { getTranslations } from "next-intl/server";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const t = await getTranslations();
  const userInfo = await getUserInfo();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t("user.settings")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("user.settings_description")}
        </p>
      </div>
      <Separator />
      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t("user.profile")}</CardTitle>
            <CardDescription>
              {t("user.profile_description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("user.name")}</Label>
              <Input
                id="name"
                defaultValue={userInfo?.nickname}
                placeholder={t("user.name_placeholder")}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("user.email")}</Label>
              <Input
                id="email"
                defaultValue={userInfo?.email}
                placeholder={t("user.email_placeholder")}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t("user.language")}</CardTitle>
            <CardDescription>
              {t("user.language_description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">{t("user.preferred_language")}</Label>
              <Input
                id="language"
                defaultValue={userInfo?.locale || "en"}
                placeholder={t("user.language_placeholder")}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{t("user.account")}</CardTitle>
            <CardDescription>
              {t("user.account_description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("user.account_type")}</Label>
              <div className="text-sm">
                {userInfo?.credits?.is_pro ? t("user.pro") : t("user.free")}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("user.credits_left")}</Label>
              <div className="text-sm">
                {userInfo?.credits?.left_credits || 0}
              </div>
            </div>
            <Button variant="outline">
              {t("user.upgrade_to_pro")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 