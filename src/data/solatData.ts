export type SolatMode = 'solo' | 'jemaah';

export type SolatAvatarPose = 
  | 'berdiri'
  | 'takbir'
  | 'qiyam'
  | 'ruku'
  | 'itidal'
  | 'sujud1'
  | 'duduk'
  | 'sujud2'
  | 'tahiyyat'
  | 'salam_kanan'
  | 'salam_kiri'
  | 'selesai';

export interface SolatStep {
  stepNumber: number;
  title: string;
  arabicTitle: string;
  rukunType: 'Rukun Qalbi' | 'Rukun Qauli' | 'Rukun Fi\'li' | 'Sunnah Ab\'adh' | 'Sunnah Hai\'ah';
  arabic: string;
  transliteration: string;
  translation: string;
  explanation: string;
  sunnahTips: string[];
  avatarPose: SolatAvatarPose;
  audioCue: string;
  buttonText: string;
}

export interface MosqueLocation {
  id: string;
  name: string;
  arabicName: string;
  city: 'Makkah' | 'Madinah';
  entranceName: string;
  entranceCoord: { x: number; z: number };
  prayerCoord: { x: number; z: number };
  triggerRadius: number;
  fadhilat: string;
  recommendedSolat: string;
  carpetColor: number;
}

export const MOSQUE_LOCATIONS: MosqueLocation[] = [
  {
    id: 'masjidil_haram',
    name: 'Masjidil Haram',
    arabicName: 'المَسْجِد الحَرَام',
    city: 'Makkah',
    entranceName: 'Pintu Masuk Utama (Bab Abdul Aziz)',
    entranceCoord: { x: 0, z: 54 },
    prayerCoord: { x: 14, z: 4.5 },
    triggerRadius: 7.0,
    fadhilat: 'Solat di Masjidil Haram bersamaan 100,000 kali ganda pahala di masjid lain. (Hadis Riwayat Ahmad & Ibn Majah)',
    recommendedSolat: 'Solat Sunat Tahiyyatul Masjid & Solat Sunat Tawaf',
    carpetColor: 0x991b1b // Deep Islamic crimson red
  },
  {
    id: 'masjid_nabawi',
    name: 'Masjid Nabawi (Raudhah Syarifah)',
    arabicName: 'المَسْجِد النَّبَوِي الشَّرِيف',
    city: 'Madinah',
    entranceName: 'Pintu Masuk Bab As-Salam',
    entranceCoord: { x: -134, z: 10 },
    prayerCoord: { x: -136, z: 15 },
    triggerRadius: 7.0,
    fadhilat: 'Solat di Masjid Nabawi bersamaan 1,000 kali ganda pahala di masjid lain, dan Raudhah adalah taman daripada taman-taman syurga! (Hadis Riwayat Bukhari & Muslim)',
    recommendedSolat: 'Solat Sunat di Raudhah Syarifah & Tahiyyatul Masjid',
    carpetColor: 0x047857 // Raudhah emerald green
  },
  {
    id: 'masjid_quba',
    name: 'Masjid Quba',
    arabicName: 'مَسْجِد قُبَاء',
    city: 'Madinah',
    entranceName: 'Pintu Masuk Utama Masjid Quba',
    entranceCoord: { x: -115, z: -27 },
    prayerCoord: { x: -115, z: -35 },
    triggerRadius: 7.0,
    fadhilat: 'Barangsiapa bersuci di rumah/hotelnya lalu solat di Masjid Quba, baginya ganjaran seumpama pahala satu Umrah yang lengkap! (Hadis Riwayat Ibn Majah, Sahih)',
    recommendedSolat: 'Solat Sunat Tahiyyatul Masjid 2 Rakaat (Pahala 1 Umrah)',
    carpetColor: 0x065f46
  },
  {
    id: 'masjid_bir_ali',
    name: 'Masjid Bir Ali (Dzulhulaifah)',
    arabicName: 'مَسْجِد ذِي الحُلَيْفَة (آبَار عَلِي)',
    city: 'Madinah',
    entranceName: 'Pintu Gerbang Miqat Bir Ali',
    entranceCoord: { x: -155, z: 20 },
    prayerCoord: { x: -155, z: 32 },
    triggerRadius: 7.5,
    fadhilat: 'Masjid Miqat Nabi ﷺ dan para jemaah menunaikan solat sunat sebelum melafazkan Niat Umrah Pertama ke Makkah.',
    recommendedSolat: 'Solat Sunat Ihram 2 Rakaat (Rakaat 1: Al-Kafirun, Rakaat 2: Al-Ikhlas)',
    carpetColor: 0x047857
  },
  {
    id: 'masjid_qiblatain',
    name: 'Masjid Qiblatain (Dua Kiblat)',
    arabicName: 'مَسْجِد القِبْلَتَيْن',
    city: 'Madinah',
    entranceName: 'Pintu Masuk Masjid Qiblatain',
    entranceCoord: { x: -150, z: -16 },
    prayerCoord: { x: -150, z: -22 },
    triggerRadius: 6.5,
    fadhilat: 'Masjid bersejarah saksi turunnya perintah Allah menukar arah kiblat dari Masjidil Aqsa ke Kaabah di Makkah semasa solat berjemaah.',
    recommendedSolat: 'Solat Sunat Tahiyyatul Masjid 2 Rakaat',
    carpetColor: 0x0f766e
  },
  {
    id: 'masjid_alghamamah',
    name: 'Masjid Alghamamah & Abu Bakar',
    arabicName: 'مَسْجِد الغَمَامَة',
    city: 'Madinah',
    entranceName: 'Pintu Masuk Masjid Alghamamah',
    entranceCoord: { x: -132, z: 5 },
    prayerCoord: { x: -132, z: 8 },
    triggerRadius: 6.0,
    fadhilat: 'Tapak Rasulullah ﷺ mendirikan Solat Istisqa\' memohon hujan lalu awan (ghamamah) memayungi Baginda dan hujan rahmat turun membasahi Madinah.',
    recommendedSolat: 'Solat Sunat Tahiyyatul Masjid & Doa Rahmat',
    carpetColor: 0x064e3b
  }
];

export const SOLAT_STEPS: SolatStep[] = [
  {
    stepNumber: 1,
    title: 'Niat & Berdiri Menghadap Kiblat (Qiyam)',
    arabicTitle: 'النِّيَّة وَالقِيَام مَعَ اسْتِقْبَالِ القِبْلَة',
    rukunType: 'Rukun Qalbi',
    arabic: 'أُصَلِّي سُنَّةَ تَحِيَّةِ الْمَسْجِدِ رَكْعَتَيْنِ لِلَّهِ تَعَالَى',
    transliteration: 'Ushalli sunnata tahiyyatil-masjidi rak\'ataini lillahi Ta\'ala.',
    translation: 'Sahaja aku menunaikan solat sunat tahiyyatul masjid dua rakaat kerana Allah Taala.',
    explanation: 'Berdiri tegak menghadap arah Kiblat (Kaabah). Niat diwajibkan di dalam hati beriringan dengan Takbiratul Ihram. Kaum lelaki dan wanita meluruskan saf dan menenangkan fikiran.',
    sunnahTips: [
      'Menghadap Kiblat dengan tepat dan memandang ke arah tempat sujud.',
      'Melafazkan niat secara lisan (sunnah) untuk membantu memantapkan keazaman hati.',
      'Jika berjemaah: niatkan makmuman (mengikut imam) bagi makmum, atau imaman bagi imam.'
    ],
    avatarPose: 'berdiri',
    audioCue: 'solat_chime',
    buttonText: 'Seterusnya: Takbiratul Ihram ➔'
  },
  {
    stepNumber: 2,
    title: 'Takbiratul Ihram',
    arabicTitle: 'تَكْبِيرَةُ الإِحْرَام',
    rukunType: 'Rukun Qauli',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar.',
    translation: 'Allah Maha Besar.',
    explanation: 'Mengangkat kedua-dua belah tangan sambil melafazkan Takbiratul Ihram dengan sebutan yang jelas dan sempurna. Inilah pintu masuk utama solat di mana diharamkan segala perbuatan luar solat.',
    sunnahTips: [
      'Lelaki: Mengangkat tangan hingga ibu jari bersetentang dengan cuping telinga, tapak tangan menghadap kiblat.',
      'Wanita: Mengangkat tangan hingga ke paras dada dengan merapatkan siku ke badan.',
      'Hadirkan keagungan Allah SWT di dalam sanubari.'
    ],
    avatarPose: 'takbir',
    audioCue: 'takbir',
    buttonText: 'Seterusnya: Qiyam & Doa Iftitah ➔'
  },
  {
    stepNumber: 3,
    title: 'Qiyam & Membaca Doa Iftitah',
    arabicTitle: 'القِيَام وَدُعَاء الاِسْتِفْتَاح',
    rukunType: 'Sunnah Hai\'ah',
    arabic: 'اللَّهُ أَكْبَرُ كَبِيرًا، وَالْحَمْدُ لِلَّهِ كَثِيرًا، وَسُبْحَانَ اللَّهِ بُكْرَةً وَأَصِيلاً. وَجَّهْتُ وَجْهِيَ لِلَّذِي فَطَرَ السَّمَاوَاتِ وَالأَرْضَ حَنِيفًا مُسْلِمًا وَمَا أَنَا مِنَ الْمُشْرِكِينَ',
    transliteration: 'Allahu Akbaru kabira, wal-hamdu lillahi kathira, wa subhanallahi bukrataw-wa-ashila. Wajjahtu wajhiya lilladzi fatharas-samawati wal-ardha hanifam-muslima, wa ma ana minal-musyrikin.',
    translation: 'Allah Maha Besar sebesar-besarnya, segala puji bagi Allah sebanyak-banyaknya, dan Maha Suci Allah pada waktu pagi dan petang. Aku hadapkan wajah hatiku kepada Tuhan yang menciptakan langit dan bumi dengan penuh keikhlasan lagi berserah diri...',
    explanation: 'Meletakkan tangan di atas dada (bersedekap), iaitu tapak tangan kanan memegang pergelangan tangan kiri. Membaca doa iftitah dengan tenang sebelum membaca surah Al-Fatihah.',
    sunnahTips: [
      'Kedudukan tangan: Antara pusat dan dada (sunnah mazhab Syafi\'i).',
      'Pandangan mata tetap fokus ke arah tempat sujud demi menjaga kekhusyukan.',
      'Membaca doa iftitah secara perlahan (sirr).'
    ],
    avatarPose: 'qiyam',
    audioCue: 'iftitah',
    buttonText: 'Seterusnya: Surah Al-Fatihah ➔'
  },
  {
    stepNumber: 4,
    title: 'Membaca Surah Al-Fatihah & Surah Lazim',
    arabicTitle: 'قِرَاءَة الفَاتِحَة وَسُورَة قَصِيرَة',
    rukunType: 'Rukun Qauli',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ۝ آمِين',
    transliteration: 'Bismillahir-Rahmanir-Rahim. Alhamdulillahi Rabbil-\'Alamin. Ar-Rahmanir-Rahim. Maliki Yaumid-Din. Iyyaka na\'budu wa iyyaka nasta\'in. Ihdinas-Shirathal-Mustaqim. Shirathalladzina an\'amta \'alayhim, ghayril-maghdhubi \'alayhim waladh-dhallin. Aamiin.',
    translation: 'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah, Tuhan sekalian alam. Yang Maha Pengasih lagi Maha Penyayang. Pemilik hari pembalasan. Hanya kepada-Mu kami menyembah dan hanya kepada-Mu kami memohon pertolongan. Tunjukilah kami jalan yang lurus...',
    explanation: 'Surah Al-Fatihah adalah Rukun Qauli yang wajib dibaca pada setiap rakaat. Selepas Al-Fatihah disunatkan mengucap "Aamiin" dan membaca surah pendek seperti Surah Al-Ikhlas atau Al-Kafirun.',
    sunnahTips: [
      'Membaca Bismillah sebagai sebahagian ayat pertama Surah Al-Fatihah.',
      'Membaca ayat demi ayat secara teratur (tartil) dengan makhraj huruf yang betul.',
      'Jika berjemaah, makmum mendengar bacaan imam kemudian membaca Al-Fatihah sendiri.'
    ],
    avatarPose: 'qiyam',
    audioCue: 'fatihah',
    buttonText: 'Seterusnya: Ruku\' Beserta Toma\'ninah ➔'
  },
  {
    stepNumber: 5,
    title: 'Ruku\' Beserta Toma\'ninah',
    arabicTitle: 'الرُّكُوع مَعَ الطُّمَأْنِينَة',
    rukunType: 'Rukun Fi\'li',
    arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ وَبِحَمْدِهِ (٣ كَالِي)',
    transliteration: 'Subhana Rabbiyal-\'Azimi wa bihamdih (3x).',
    translation: 'Maha Suci Tuhanku Yang Maha Agung dan segala puji bagi-Nya (dibaca 3 kali).',
    explanation: 'Membongkokkan badan kira-kira 90 darjah sehingga belakang dan kepala berada dalam garisan mendatar yang lurus. Kedua-dua tapak tangan memegang lutut dengan tenang (toma\'ninah).',
    sunnahTips: [
      'Mengangkat kedua-dua tangan semasa bertakbir untuk ruku\'.',
      'Meratakan tulang belakang dan tidak mendongak mahupun terlalu menunduk.',
      'Toma\'ninah: Berhenti diam sekurang-kurangnya sekadar tempoh membaca satu tasbih.'
    ],
    avatarPose: 'ruku',
    audioCue: 'ruku',
    buttonText: 'Seterusnya: I\'tidal ➔'
  },
  {
    stepNumber: 6,
    title: 'I\'tidal Beserta Toma\'ninah',
    arabicTitle: 'الاِعْتِدَال مَعَ الطُّمَأْنِينَة',
    rukunType: 'Rukun Fi\'li',
    arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ ۝ رَبَّنَا وَلَكَ الْحَمْدُ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ',
    transliteration: 'Sami\'allahu liman hamidah. Rabbana wa lakal-hamdu hamdan katsiran thayyiban mubarakan fiih.',
    translation: 'Allah mendengar sesiapa yang memuji-Nya. Wahai Tuhan kami, dan bagi-Mu segala puji, pujian yang banyak, baik lagi penuh berkat.',
    explanation: 'Bangkit dari ruku\' sehingga badan kembali tegak lurus seperti sedia kala. Mengangkat tangan ketika bangkit sambil melafazkan tahmid, lalu bertenang sejenak (toma\'ninah).',
    sunnahTips: [
      'Mengangkat tangan ke paras bahu/telinga semasa bangkit dari ruku\'.',
      'Memastikan seluruh sendi kembali tegak pada kedudukan asal sebelum sujud.',
      'Makmum melafazkan: Rabbana walakal hamd.'
    ],
    avatarPose: 'itidal',
    audioCue: 'itidal',
    buttonText: 'Seterusnya: Sujud Pertama ➔'
  },
  {
    stepNumber: 7,
    title: 'Sujud Pertama Beserta Toma\'ninah',
    arabicTitle: 'السُّجُود الأَوَّل مَعَ الطُّمَأْنِينَة',
    rukunType: 'Rukun Fi\'li',
    arabic: 'سُبْحَانَ رَبِّيَ الأَعْلَى وَبِحَمْدِهِ (٣ كَالِي)',
    transliteration: 'Subhana Rabbiyal-A\'la wa bihamdih (3x).',
    translation: 'Maha Suci Tuhanku Yang Maha Tinggi dan segala puji bagi-Nya (dibaca 3 kali).',
    explanation: 'Merebahkan diri untuk sujud dengan 7 anggota sujud menyentuh lantai: dahi dan hidung, kedua tapak tangan, kedua lutut, dan hujung jari kedua-dua belah kaki yang dilenturkan menghadap kiblat.',
    sunnahTips: [
      'Mendahulukan kedua-dua lutut ke lantai sebelum tapak tangan.',
      'Dahi mestilah terbuka dan bersentuhan terus dengan lantai tanpa halangan berlapik.',
      'Lelaki: Menjarakkan sedikit siku dari lambung. Wanita: Merapatkan siku ke tubuh.',
      'Saat sujud adalah kedudukan paling hampir seorang hamba dengan Tuhannya.'
    ],
    avatarPose: 'sujud1',
    audioCue: 'sujud',
    buttonText: 'Seterusnya: Duduk Antara Dua Sujud ➔'
  },
  {
    stepNumber: 8,
    title: 'Duduk Antara Dua Sujud',
    arabicTitle: 'الجُلُوس بَيْنَ السَّجْدَتَيْن',
    rukunType: 'Rukun Fi\'li',
    arabic: 'رَبِّ اغْفِرْ لِي، وَارْحَمْنِي، وَاجْبُرْنِي، وَارْفَعْنِي، وَارْزُقْنِي، وَاهْدِنِي، وَعَافِنِي، وَاعْفُ عَنِّي',
    transliteration: 'Rabbighfirlii warhamnii wajburnii warfa\'nii warzuqnii wahdinii wa\'aafinii wa\'fu \'annii.',
    translation: 'Wahai Tuhanku, ampunilah dosaku, rahmatilah aku, cukupkanlah kekuranganku, tinggikanlah darjatku, kurniakanlah rezeki kepadaku, berilah aku hidayah, sihatkanlah aku dan maafkanlah kesalahanku.',
    explanation: 'Bangkit dari sujud dengan bertakbir lalu duduk bersimpuh (duduk iftirasy) secara tenang dan bertoma\'ninah. Doa ini mengandungi 8 permohonan kebaikan dunia dan akhirat yang paling lengkap.',
    sunnahTips: [
      'Duduk iftirasy: Duduk di atas kaki kiri yang dihamparkan, manakala tapak kaki kanan ditegakkan dengan jari menghadap kiblat.',
      'Kedua-dua tapak tangan diletakkan di atas paha berhampiran lutut.',
      'Membaca doa permohonan keampunan dengan penuh penghayatan.'
    ],
    avatarPose: 'duduk',
    audioCue: 'duduk',
    buttonText: 'Seterusnya: Sujud Kedua ➔'
  },
  {
    stepNumber: 9,
    title: 'Sujud Kedua Beserta Toma\'ninah',
    arabicTitle: 'السُّجُود الثَّانِي مَعَ الطُّمَأْنِينَة',
    rukunType: 'Rukun Fi\'li',
    arabic: 'سُبْحَانَ رَبِّيَ الأَعْلَى وَبِحَمْدِهِ (٣ كَالِي)',
    transliteration: 'Subhana Rabbiyal-A\'la wa bihamdih (3x).',
    translation: 'Maha Suci Tuhanku Yang Maha Tinggi dan segala puji bagi-Nya (dibaca 3 kali).',
    explanation: 'Melakukan sujud kedua seperti mana sujud pertama dengan penuh ketundukan dan kerendahan diri di hadapan Kebesaran Allah SWT.',
    sunnahTips: [
      'Menyempurnakan toma\'ninah pada sujud kedua.',
      'Memperbanyakkan doa di dalam hati semasa sujud.',
      'Selesai sujud kedua pada rakaat kedua, jemaah terus duduk untuk Tahiyyat Akhir.'
    ],
    avatarPose: 'sujud2',
    audioCue: 'sujud',
    buttonText: 'Seterusnya: Tahiyyat Akhir ➔'
  },
  {
    stepNumber: 10,
    title: 'Tahiyyat Akhir (Tasyahhud & Selawat Ibrahimiyyah)',
    arabicTitle: 'التَّشَهُّد الأَخِير وَالصَّلاَة الإِبْرَاهِيمِيَّة',
    rukunType: 'Rukun Qauli',
    arabic: 'التَّحِيَّاتُ الْمُبَارَكَاتُ الصَّلَوَاتُ الطَّيِّبَاتُ لِلَّهِ، السَّلاَمُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلاَمُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ. اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ...',
    transliteration: 'Attahiyyatul-mubarakatus-shalawatuth-thayyibatu lillah. Assalamu \'alayka ayyuhan-Nabiyyu wa rahmatullahi wa barakatuh. Assalamu \'alayna wa \'ala \'ibadillahis-shalihin. Asyhadu alla ilaha illallah, wa asyhadu anna Muhammadar-Rasulullah. Allahumma shalli \'ala Muhammad wa \'ala aali Muhammad...',
    translation: 'Segala ucapan selamat yang berkat, segala doa yang baik adalah kepunyaan Allah. Salam sejahtera ke atasmu wahai Nabi, berserta rahmat Allah dan keberkatan-Nya. Salam sejahtera ke atas kami dan hamba-hamba Allah yang soleh. Aku bersaksi bahawa tiada Tuhan melainkan Allah dan aku bersaksi bahawa Nabi Muhammad utusan Allah...',
    explanation: 'Duduk tawarruk pada rakaat akhir. Membaca lafaz tasyahhud dan berselawat ke atas Nabi Muhammad ﷺ dan keluarganya (Selawat Ibrahimiyyah). Menegakkan jari telunjuk kanan ketika menyebut lafaz syahadah.',
    sunnahTips: [
      'Duduk Tawarruk: Mengeluarkan kaki kiri ke sebelah kanan dan duduk di atas lantai.',
      'Mengangkat jari telunjuk kanan sedikit condong ke arah kiblat ketika lafaz "Illallah".',
      'Pandangan mata beralih memandang jari telunjuk semasa ia diangkat.'
    ],
    avatarPose: 'tahiyyat',
    audioCue: 'tahiyyat',
    buttonText: 'Seterusnya: Memberi Salam ➔'
  },
  {
    stepNumber: 11,
    title: 'Memberi Salam (Ke Kanan & Ke Kiri)',
    arabicTitle: 'التَّسْلِيم يَمِينًا وَشِمَالاً',
    rukunType: 'Rukun Qauli',
    arabic: 'السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ (يَمِينًا) ۝ السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ (شِمَالاً)',
    transliteration: 'Assalamu \'alaykum wa rahmatullah (ke kanan) • Assalamu \'alaykum wa rahmatullah (ke kiri).',
    translation: 'Semoga kesejahteraan dan rahmat Allah dilimpahkan ke atas kamu sekalian.',
    explanation: 'Memberi salam yang pertama sambil memalingkan muka ke kanan sehingga pipi kelihatan dari belakang (Rukun Solat penutup). Kemudian memberi salam yang kedua sambil memalingkan muka ke kiri (Sunnah).',
    sunnahTips: [
      'Salam pertama adalah rukun yang menamatkan ibadah solat secara sah.',
      'Memalingkan muka ke kanan serentak dengan sebutan salam pertama.',
      'Niatkan keluar daripada solat dan memberi salam kepada para malaikat dan para jemaah.'
    ],
    avatarPose: 'salam_kanan',
    audioCue: 'salam',
    buttonText: 'Sempurnakan Solat & Terima Pahala ➔'
  },
  {
    stepNumber: 12,
    title: 'Selesai Solat & Penerimaan Ganjaran Pahala',
    arabicTitle: 'الاِنْتِهَاء مِنَ الصَّلاَة وَالأَجْر وَالثَّوَاب',
    rukunType: 'Sunnah Hai\'ah',
    arabic: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ ۝ اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ',
    transliteration: 'Astaghfirullahal-\'Azim alladzi laa ilaha illa Huwal-Hayyul-Qayyum wa atuubu ilayh. Allahumma Antas-Salam wa minkas-salam, tabarakta ya Dzal-Jalali wal-Ikram.',
    translation: 'Aku memohon keampunan Allah Yang Maha Agung yang tiada Tuhan melainkan Dia, Yang Maha Hidup lagi Mentadbir sekalian alam dan aku bertaubat kepada-Nya. Ya Allah, Engkaulah Tuhan Yang Maha Sejahtera dan daripada-Mulah datangnya kesejahteraan...',
    explanation: 'Alhamdulillah! Solat telah disempurnakan mengikut tertib dan rukun. Pahala telah dikreditkan ke dalam akaun amalan jemaah: Solat Solo = 1 Pahala, Solat Berjemaah = 27 Pahala (mengikut sabda Rasulullah ﷺ)!',
    sunnahTips: [
      'Membaca istighfar 3 kali dan wirid selepas solat.',
      'Memperbanyakkan tasbih (Subhanallah 33x), tahmid (Alhamdulillah 33x), dan takbir (Allahu Akbar 33x).',
      'Mengamalkan solat secara berjemaah untuk menggandakan ganjaran sehingga 27 kali ganda!'
    ],
    avatarPose: 'selesai',
    audioCue: 'reward',
    buttonText: 'Tutup & Teruskan Ibadah'
  }
];
