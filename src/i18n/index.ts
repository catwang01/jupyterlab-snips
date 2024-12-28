import { PageConfig } from '@jupyterlab/coreutils';
import { enUS } from './en-US';
import { zhCN } from './zh-CN';

type Locale = 'en-US' | 'zh-CN';
type Translation = typeof enUS | typeof zhCN;

const translations: Record<Locale, Translation> = {
    'en-US': enUS,
    'zh-CN': zhCN
};

export function getTranslation(): Translation {
    const locale = (PageConfig.getOption('locale') || 'en-US') as Locale;
    return translations[locale] || translations['en-US'];
} 