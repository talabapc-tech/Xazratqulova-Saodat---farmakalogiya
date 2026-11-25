# Xazratqulova-Saodat---farmakalogiya

"Farmakologiya va retseptura asoslari" moduli — raqamli ta'lim resursi (RTR).

- Muallif: Xazratqulova Saodat, Shahrisabz Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi
- Mutaxassislik: 50910208 — Hamshiralik ishi (90 soat: nazariy 20, amaliy 40, mustaqil 30)
- Samsung One UI uslubidagi dizayn, yorug' va qorong'i rejim, internetsiz ishlaydi (PWA)

## Imkoniyatlar
- **30 mavzu** (KMR bo'yicha): ma'ruza, plakat, sxema, test, lug'at, savollar, mashq, baholash mezonlari
- **30 ta plakat** (vektor infografika): kattalashtirish, PNG yuklab olish, chop etish
- **Dorilar ma'lumotnomasi**: 105 ta dori kartochkasi, guruhlar bo'yicha va qidiruv bilan
- **Retsept simulyatori**: retsept yoziladi va tekshiriladi
- **Kalkulyatorlar**: doza, bolalar dozasi, insulin, suyultirish, % eritma, infuziya
- **Vaziyatli simulyator**: 6 ta tarmoqlanuvchi klinik stsenariy
- **Dorilar o'yini**, **imtihon rejimi** (30 savol, 40 daqiqa, baho, xatolar bilan ishlash), yakuniy test
- **Chop etiladigan blanklar**: retsept, narkotik hisobi jurnali, FEFO jurnali, dori tayinlash varag'i
- Har mavzu uchun **Word (ma'ruza)** va **PowerPoint (taqdimot)** fayllari

## Ishga tushirish
`index.html` faylini brauzerda oching. Server va internet kerak emas.

## Vercel (avtomatik deploy)
Statik sayt, `vercel.json` tayyor. Vercel'da repozitoriy bir marta ulanadi (Add New → Project →
shu repozitoriy → Deploy). Shundan keyin `main` branch'ga har bir `git push` avtomatik deploy qilinadi.
HTTPS orqali ochilganda sayt telefonga ilova sifatida o'rnatiladi, "Asboblar" bo'limidagi
tugma bilan barcha ma'lumotlar internetsiz ishlash uchun saqlanadi.

## Tarkibi
```
index.html, manifest.webmanifest, sw.js, vercel.json
assets/app.css, app.js, tools.js, data.js
assets/topics/    mavzular kontenti (f01 ... f30)
assets/posters/   plakatlar (p01 ... p30)
assets/drugs/     dorilar ma'lumotnomasi
assets/scenarios.js   simulyator stsenariylari
assets/docs/      Word va PowerPoint fayllar
```

Dozalar va hisob-kitoblar o'quv maqsadida berilgan: amalda dori faqat shifokor tayinlovi asosida qo'llaniladi.
