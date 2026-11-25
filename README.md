# Xazratqulova-Saodat---farmakalogiya

"Farmakologiya va retseptura asoslari" moduli — raqamli ta'lim resursi (RTR).

- Muallif: Xazratqulova Saodat, Shahrisabz Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi
- Mutaxassislik: 50910208 — Hamshiralik ishi (90 soat: nazariy 20, amaliy 40, mustaqil 30)
- 30 mavzu (KMR bo'yicha), har birida ma'ruza, sxema, test, lug'at, savollar, baholash mezonlari
- Interaktiv mashqlar: doza kalkulyatorlari, retsept trenajyori, FEFO, antidotlar, ABCDE, anafilaksiya
- Samsung One UI uslubidagi dizayn, yorug' va qorong'i rejim, internetsiz ishlaydi

## Ishga tushirish
`index.html` faylini brauzerda oching. Server va internet kerak emas.

## Vercel (avtomatik deploy)
Statik sayt, `vercel.json` tayyor. Vercel'da repozitoriy bir marta ulanadi (Add New → Project →
shu repozitoriy → Deploy). Shundan keyin `main` branch'ga har bir `git push` avtomatik deploy qilinadi.

## Tarkibi
```
index.html            dasturiy qobiq
vercel.json           Vercel sozlamasi
assets/app.css        dizayn (One UI)
assets/app.js         dastur
assets/data.js        modul va mavzular (KMR)
assets/topics/        mavzular kontenti (f01 ... f30)
```
