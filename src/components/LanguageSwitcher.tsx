import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_LANGUAGES } from "@/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();

  const handleChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ?? SUPPORTED_LANGUAGES[0];

  return (
    <div className="flex items-center gap-1">
      {!compact && <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
      <Select value={i18n.language} onValueChange={handleChange}>
        <SelectTrigger
          className={compact ? "w-[70px] h-7 text-[11px] px-2" : "w-full h-8 text-xs px-2"}
          aria-label={t("language.select")}
        >
          <SelectValue>
            <span>{current.flag} {compact ? current.code.toUpperCase().slice(0, 2) : current.label}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} className="text-xs">
              {lang.flag} {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
