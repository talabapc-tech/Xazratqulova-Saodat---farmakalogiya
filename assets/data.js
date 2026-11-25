window.PSX = {
  ver: 1,
  module: {
    title: "Farmakologiya va retseptura asoslari",
    short: "Farmakologiya",
    author: "Xazratqulova Saodat",
    author_role: "Fan öqituvçisi",
    org: "Şahrisabz Abu Ali ibn Sino nomidagi jamoat salomatligi texnikumi",
    region: "Qaşqadaryo viloyati",
    year: "2026–2027 öquv yili",
    spec_code: "50910208",
    spec_name: "Hamşiralik işi",
    qualification: "Umumiy amaliyot hamşirasi",
    credits: 3,
    hours: { jami: 90, nazariy: 20, amaliy: 40, mustaqil: 30 }
  },

  /* KMR: o'qitiş natijalari (bo'limlar) */
  sections: [
    { n: 1, color: "blue",   title: "Dori şakllari, retseptura va dozalaş asoslarini qöllaydi hamda yuboriş yölini tanlaydi" },
    { n: 2, color: "purple", title: "Dori vositalarining farmakokinetik va farmakodinamik taʼsirini tahlil qiladi" },
    { n: 3, color: "teal",   title: "Dori vositalarini xavfsiz qöllaydi va sarf-xarajat hisobini yuritadi" },
    { n: 4, color: "green",  title: "Asosiy dori guruhlarini farqlaydi, nojöya taʼsirlarini va farmakoterapiya samaradorligini baholaydi" },
    { n: 5, color: "red",    title: "Dori asoratlari va zaharlanişlarda bemor holatini baholaydi hamda şoşilinç farmakoterapiya taktikasini tanlaydi" }
  ],

  /* [nomi, N/A, bo'lim, interaktivlar] — tartib KMR bo'yiça, kontent: assets/topics/fNN.js */
  topics: [
    ["Farmakologiya faniga kiriş. Dori şakllari tasnifi", "N", 1],
    ["Dori şakllari va ularga retsept yoziş qoidalari", "A", 1, ["recipe"]],
    ["Umumiy dorinoma (retseptura). Retsept tuzilişi va şakllari. Retsept yoziş qoidalari", "A", 1, ["recipe"]],
    ["Doza turlari. Dori dozalarini hisoblaş", "A", 1, ["dose"]],
    ["Umumiy farmakologiya tuşunçasi. Dori vositalarining farmakokinetikasi", "N", 2],
    ["Dori vositalarining farmakodinamikasi", "N", 2],
    ["Markaziy nerv tizimiga taʼsir qiluvçi preparatlar: tasnifi va qöllanilişi", "N", 3],
    ["Narkotik vositalarni saqlaş va hisobotini yuritiş", "A", 3, ["storage"]],
    ["Dori vositalarini saqlaş. FEFO va min-max tamoyillari", "A", 3, ["fefo", "storage"]],
    ["Dori vositalarini infeksion xavfsizlik talablariga binoan tayyorlaş", "A", 3],
    ["Periferik nerv tizimiga taʼsir qiluvçi preparatlar. Dori vositalarining nojöya, toksik va allergik reaksiyalari", "N", 4],
    ["Afferent innervatsiyaga taʼsir qiluvçi dori vositalarini xavfsiz qöllaş çoralari", "A", 4],
    ["Efferent innervatsiyaga taʼsir qiluvçi dori vositalarini xavfsiz qöllaş çoralari", "A", 4],
    ["Yurak-qon tomir tizimiga taʼsir qiluvçi preparatlar: tasnifi va qöllanilişi", "N", 4],
    ["Yurak-qon tomir tizimiga taʼsir qiluvçi preparatlarning klinik qöllanilişi", "A", 4],
    ["Diuretik vositalar va ularni qöllaşga körsatmalar", "A", 4],
    ["Nafas oliş tizimiga taʼsir qiluvçi preparatlar: tasnifi va taʼsir mexanizmi", "N", 4],
    ["Nafas oliş tizimiga taʼsir qiluvçi preparatlarning qöllanilişi, körsatmalar va signaturasini tahlil qiliş", "A", 4],
    ["Ovqat hazm qiliş tizimiga taʼsir qiluvçi preparatlar tasnifi", "N", 4],
    ["Ovqat hazm qiliş tizimiga taʼsir qiluvçi preparatlarning qöllanilişi va signaturasini tahlil qiliş", "A", 4],
    ["Töqima almaşinuvi jarayoniga taʼsir qiluvçi vositalarni qöllaşga körsatmalar", "A", 4],
    ["Antibiotiklar tasnifi va asosiy nojöya taʼsirlari", "N", 4],
    ["Antibiotiklarning qöllanilişi, retsept yoziş va kundalikka qayd etiş", "A", 4, ["recipe"]],
    ["Immun jarayonlarga taʼsir qiluvçi, allergiyaga va yalliğlanişga qarşi vositalar: vazifasi va nojöya taʼsirlari", "N", 4],
    ["Immun jarayonlarga taʼsir qiluvçi va allergiyaga qarşi vositalarning qöllanilişi, retsept yoziş va signaturasini tahlil qiliş", "A", 4],
    ["Yalliğlanişga qarşi vositalarning qöllanilişi, retsept yoziş va signaturasini tahlil qiliş", "A", 4],
    ["Dori moddalaridan ötkir zaharlanişlarda davolaş usullari", "A", 5, ["antidote"]],
    ["Ötkir oğriq holatlarida analgetik, sedativ va miorelaksantlarni qöllaş", "A", 5, ["dose"]],
    ["ABCDE algoritmi böyiça şoşilinç farmakoterapiya ötkaziş", "A", 5, ["abcde", "anaphylaxis"]],
    ["Gemostatik preparatlarni qöllaş, dozalarini aniqlaş va kundalikka qayd etiş", "A", 5, ["dose"]]
  ]
};
