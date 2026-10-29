This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Лауреаты и видеоархив

Блок «Лауреаты» (`laureates_section`) расположен после победителей и перед фотоархивом.
В Directus редактируются видимость блока, заголовок, подзаголовок, список компаний,
порядок компаний, переключатель «Выделить ярче и жирнее» и строка городов.
Городов может быть любое количество: размер шрифта задаётся отдельно для
компьютеров и телефонов (10–32 px). По умолчанию города прокручиваются непрерывной
бегущей строкой. В Directus можно отключить прокрутку или задать длительность
полного прохода (10–180 секунд; больше число — медленнее движение).
По умолчанию полный проход занимает 60 секунд. Наведение на текст или фокус
с клавиатуры приостанавливает движение. При системной настройке уменьшения движения
города показываются обычным текстом с переносами. Enter задаёт явный перенос
в обычном режиме; в бегущей строке переносы заменяются разделителями.
Названия компаний и города — обычный текст без ссылок. Пустой список или выключенная
видимость скрывают блок. Данные загружаются вместе с остальными разделами страницы.

В фотоархиве ссылки на видео VK автоматически открывают модальное окно с плеером.
Альбомы и остальные ссылки сохраняют переход в новую вкладку. Поддерживаются
`vk.com`, `vk.ru`, `vkvideo.ru`, ссылки `video_ext.php` и параметр `z=video…`.
Для ролика можно указать необязательную «Ссылку на VK-плеер»: значение `src` из
кода встраивания VK с параметром `hash`. Исходная ссылка остаётся доступной в окне
плеера. Закрытие окна удаляет iframe и останавливает воспроизведение.

Для первичной настройки другой базы Directus:

```powershell
# .env: NEXT_PUBLIC_DIRECTUS_URL и DIRECTUS_ADMIN_TOKEN (только на сервере)
npm run cms:setup-laureates
```

Скрипт добавляет коллекцию, начальные тексты из задания, русские подписи полей,
доступ на чтение для публичной политики и права редактора по образцу фотоархива.
Повторный запуск сохраняет уже введённый контент и существующие права.
Административный токен используется только скриптом и не попадает в браузер.

Проверки: `npm run test:gallery`, `npx tsc --noEmit`, `npm run build`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
