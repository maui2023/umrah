import { ZiarahSpot } from '../types';

export const ZIARAH_SPOTS: ZiarahSpot[] = [
  // ==========================================
  // ➤ ZIARAH DALAM MADINAH (Berjalan Kaki)
  // ==========================================
  {
    id: 'saqifah_bani_saedah',
    number: 1,
    title: 'Saqifah Bani Saedah',
    arabicTitle: 'سَقِيفَة بَنِي سَاعِدَة',
    category: 'dalam_madinah',
    categoryLabel: 'Ziarah Dalam Madinah',
    transportType: 'walk',
    transportBadge: '🚶 Berjalan Kaki (Kawasan Madinah)',
    shortDesc: 'Tempat perjumpaan bersejarah pembai\'ahan Khalifah Pertama Abu Bakar As-Siddiq R.A.',
    historicalStory:
      'Terletak di barat laut Masjid Nabawi. Sejurus selepas kewafatan Rasulullah ﷺ pada tahun 11H, para sahabat Ansar dan Muhajirin berhimpun di Saqifah (tempat berteduh) Bani Saedah bagi menentukan kepimpinan umat Islam. Dengan kebijaksanaan Saidina Umar R.A. dan para sahabat, Saidina Abu Bakar As-Siddiq R.A. telah dibai\'ah secara muafakat sebagai Khalifah Rasulullah yang pertama demi memelihara kesatuan ummah.',
    sunnahOrAdab:
      'Mengingati jasa para sahabat dalam menegakkan daulah Islamiah dan berdoa memohon perpaduan serta keharmonian ummah.',
    dua: {
      id: 'dua_saqifah',
      stage: 'ziarah_dalam',
      title: 'Doa Memohon Perpaduan & Keikhlasan Hati',
      location: 'Saqifah Bani Saedah',
      arabic: 'رَبَّنَا اغْفِرْ لَنَا وَلإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالإِيمَانِ وَلاَ تَجْعَلْ فِي قُلُوبِنَا غِلاًّ لِّلَّذِينَ آمَنُوا رَبَّنَا إِنَّكَ رَءُوفٌ رَّحِيمٌ',
      transliteration: 'Rabbana-ghfir lana wa li-ikhwanina-lladhina sabaquna bil-iiman, wa la taj\'al fi qulubina ghillal-lilladhina aamanu, Rabbana innaka Ra-ufur-Rahim.',
      translation: 'Wahai Tuhan kami, ampunkanlah dosa kami dan saudara-saudara kami yang mendahului kami dalam keimanan, dan janganlah Engkau jadikan dalam hati kami sebarang hasad dengki terhadap orang-orang yang beriman. Wahai Tuhan kami, sesungguhnya Engkau Maha Lembut lagi Maha Mengasihani.',
      sunnahNote: 'Surah Al-Hasyr: Ayat 10. Dibaca untuk mendoakan para sahabat Nabi ﷺ.'
    },
    actionText: 'Dengar Kisah Mutawwif & Teruskan',
    actionIcon: '🚶',
    coordinates: { x: -130, z: 2 }
  },
  {
    id: 'masjid_ghamamah_abu_bakar_ali',
    number: 2,
    title: 'Masjid Alghamamah, Masjid Abu Bakar, Masjid Ali',
    arabicTitle: 'مَسْجِد الغَمَامَة وَأَبُو بَكْر وَعَلِي',
    category: 'dalam_madinah',
    categoryLabel: 'Ziarah Dalam Madinah',
    transportType: 'walk',
    transportBadge: '🚶 Berjalan Kaki (Kawasan Madinah)',
    shortDesc: 'Kawasan masjid-masjid bersejarah berhampiran barat daya Masjid Nabawi.',
    historicalStory:
      'Masjid Alghamamah (Ghamamah bermaksud "awan yang memayungi") adalah tapak di mana Rasulullah ﷺ menunaikan Solat Istisqa\' (memohon hujan) dan solat Hari Raya. Ketika Baginda berdoa, gumpalan awan hitam berarak memayungi Baginda lalu hujan rahmat turun membasahi bumi Madinah. Berhampirannya terletak Masjid Abu Bakar As-Siddiq dan Masjid Ali bin Abi Talib, tempat kedua-dua khalifah ini pernah mengimami solat hari raya semasa zaman khilafah mereka.',
    sunnahOrAdab:
      'Menghayati tawaduk Rasulullah ﷺ dan sentiasa memohon istighfar serta rahmat hujan dan keberkatan rezeki daripada Allah Taala.',
    dua: {
      id: 'dua_istisqa',
      stage: 'ziarah_dalam',
      title: 'Doa Memohon Rahmat & Keberkatan',
      location: 'Masjid Alghamamah',
      arabic: 'اللَّهُمَّ اسْقِنَا غَيْثًا مُغِيثًا مَرِيئًا مَرِيعًا نَافِعًا غَيْرَ ضَارٍّ، عَاجِلاً غَيْرَ آجِلٍ',
      transliteration: 'Allahumma-sqinaa ghaythan mughiithan marii-an marii\'an naafi\'an ghayra dhaar, \'aajilan ghayra aajil.',
      translation: 'Ya Allah, siramilah kami dengan hujan yang menyelamatkan, menyuburkan, menyenangkan, memberi manfaat dan tidak mendatangkan mudarat, dengan segera tanpa ditunda.',
      sunnahNote: 'Doa Nabi ﷺ ketika memohon hujan di tapak Masjid Alghamamah.'
    },
    actionText: 'Hayai Sejarah & Teruskan',
    actionIcon: '🕌',
    coordinates: { x: -132, z: 8 }
  },
  {
    id: 'maqam_rasulullah_sahabat',
    number: 3,
    title: 'Maqam Rasulullah ﷺ & Para Sahabat',
    arabicTitle: 'المُوَاجَهَة الشَّرِيفَة (مَقَام النَّبِي ﷺ وَصَاحِبَيْهِ)',
    category: 'dalam_madinah',
    categoryLabel: 'Ziarah Dalam Madinah',
    transportType: 'walk',
    transportBadge: '🚶 Berjalan Kaki (Kawasan Madinah)',
    shortDesc: 'Memberi salam dengan penuh tawaduk dan adab di hadapan Maqam Baginda ﷺ, Abu Bakar & Umar R.A.',
    historicalStory:
      'Rasulullah ﷺ disemadikan di bilik Sayyidatina Aisyah R.Anha, tempat Baginda wafat. Di sisi Baginda disemadikan sahabat karibnya Saidina Abu Bakar As-Siddiq R.A. dan Saidina Umar Al-Khattab R.A. Berdiri di hadapan Al-Muwajahah As-Syarifah merupakan detik paling menyentuh jiwa setiap jemaah untuk menyatakan kerinduan, kecintaan, dan kesyukuran atas risalah Islam yang dibawa Baginda.',
    sunnahOrAdab:
      'Hadirkan rasa gerun, rendahkan suara, dan ucapkan salam dengan tenang dan penuh hormat tanpa memegang atau mengusap jeriji besi makam.',
    dua: {
      id: 'dua_salam_rasulullah',
      stage: 'ziarah_dalam',
      title: 'Salam Kepada Baginda Rasulullah ﷺ',
      location: 'Muwajahah Syarifah Masjid Nabawi',
      arabic: 'الصَّلاَةُ وَالسَّلاَمُ عَلَيْكَ يَا رَسُولَ اللَّهِ، الصَّلاَةُ وَالسَّلاَمُ عَلَيْكَ يَا حَبِيبَ اللَّهِ، أَشْهَدُ أَنَّكَ قَدْ بَلَّغْتَ الرِّسَالَةَ وَأَدَّيْتَ الأَمَانَةَ وَنَصَحْتَ الأُمَّةَ',
      transliteration: 'Assalatu was-salamu \'alayka ya Rasulullah, Assalatu was-salamu \'alayka ya Habiballah. Asyhadu annaka qad ballaghtar-risalah, wa addaytal-amanah, wa nasahtal-ummah.',
      translation: 'Selawat dan salam ke atasmu wahai Rasulullah, selawat dan salam ke atasmu wahai kekasih Allah. Aku bersaksi bahawa sesungguhnya engkau telah menyampaikan risalah, menunaikan amanah, dan menasihati umat.',
      sunnahNote: 'Kemudian melangkah setapak ke kanan memberi salam kepada Saidina Abu Bakar R.A., dan setapak lagi kepada Saidina Umar R.A.'
    },
    actionText: 'Sampaikan Salam & Berselawat',
    actionIcon: '💚',
    coordinates: { x: -135, z: 12 }
  },
  {
    id: 'raudhah_nusuk',
    number: 4,
    title: 'Raudhah Syarifah (Taman Syurga)',
    arabicTitle: 'الرَّوْضَة الشَّرِيفَة (رَوْضَة مِنْ رِيَاضِ الجَنَّة)',
    category: 'dalam_madinah',
    categoryLabel: 'Ziarah Dalam Madinah',
    transportType: 'walk',
    transportBadge: '🚶 Berjalan Kaki (Kawasan Madinah - Permohonan Nusuk)',
    shortDesc: 'Ruang istimewa antara mimbar dan makam Nabi ﷺ dengan permaidani hijau (Ziarah berjalan kaki di Madinah).',
    historicalStory:
      'Rasulullah ﷺ bersabda: "Di antara rumahku dan mimbarku adalah sebuah taman daripada taman-taman syurga (Raudhah min Riyadhil Jannah), dan mimbarku berada di atas telagaku." (Hadis Riwayat Bukhari & Muslim). Mengikut peraturan terkini, masuk ke Raudhah memerlukan permit tempahan khas melalui aplikasi Nusuk demi menjamin ketertiban dan keselesaan para jemaah.',
    sunnahOrAdab:
      'Mengambil peluang solat sunat tahiyyatul masjid / taubat / hajat 2 rakaat di atas permaidani hijau Raudhah, berselawat dan memperbanyakkan doa yang tulus.',
    dua: {
      id: 'dua_raudhah',
      stage: 'ziarah_dalam',
      title: 'Doa Di Raudhah Syarifah',
      location: 'Raudhah Syarifah (Permaidani Hijau)',
      arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنَ الْخَيْرِ كُلِّهِ عَاجِلِهِ وَآجِلِهِ، مَا عَلِمْتُ مِنْهُ وَمَا لَمْ أَعْلَمْ، وَأَعُوذُ بِكَ مِنَ الشَّرِّ كُلِّهِ عَاجِلِهِ وَآجِلِهِ',
      transliteration: 'Allahumma inni as-aluka minal-khayri kullihi \'aajilihi wa aajilihi, maa \'alimtu minhu wa maa lam a\'lam, wa a\'uudzu bika minasy-syarri kullihi \'aajilihi wa aajilihi.',
      translation: 'Ya Allah, sesungguhnya aku memohon kepada-Mu segala kebaikan, sama ada yang segera mahupun yang tertangguh, yang aku ketahui mahupun yang tidak aku ketahui. Dan aku berlindung dengan-Mu daripada segala keburukan.',
      sunnahNote: 'Doa jawami\'ul kalim yang amat mustajab di Raudhah Syarifah.'
    },
    actionText: 'Solat Sunat & Berdoa di Raudhah',
    actionIcon: '🌿',
    coordinates: { x: -136, z: 15 }
  },
  {
    id: 'perkuburan_baqi',
    number: 5,
    title: 'Perkuburan Baqi\' & Para Sahabat',
    arabicTitle: 'جَنَّة البَقِيع (بَقِيع الغَرْقَد)',
    category: 'dalam_madinah',
    categoryLabel: 'Ziarah Dalam Madinah',
    transportType: 'walk',
    transportBadge: '🚶 Berjalan Kaki (Kawasan Madinah - Salam dari Jauh)',
    shortDesc: 'Persemadian lebih 10,000 sahabat Nabi ﷺ di sisi Masjid Nabawi. Ziarah berjalan kaki sebelum bersiap menaiki bas.',
    historicalStory:
      'Terletak di sebelah timur Masjid Nabawi. Dikenali sebagai Baqi\' Al-Gharqad. Di sinilah disemadikan insan-insan mulia seperti Saidina Uthman bin Affan R.A., para isteri Nabi (Ummahatul Mukminin) seperti Aisyah, Hafsah, Ummu Salamah (kecuali Khadijah di Ma\'la Makkah & Maimunah di Sarif), anak-anak Nabi termasuk Fatimah Az-Zahra, Abbas bin Abdul Muttalib, Hasan bin Ali, dan ribuan sahabat syuhada.',
    sunnahOrAdab:
      'Memberi salam dari pintu pagar tanpa meraung atau meratapi kubur, dan mendoakan keselamatan serta keampunan bagi seluruh ahli kubur.',
    dua: {
      id: 'dua_baqi',
      stage: 'ziarah_dalam',
      title: 'Salam Menziarahi Ahli Baqi\'',
      location: 'Perkuburan Baqi\' Al-Gharqad',
      arabic: 'السَّلاَمُ عَلَيْكُمْ دَارَ قَوْمٍ مُؤْمِنِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لاَحِقُونَ، يَغْفِرُ اللَّهُ لَنَا وَلَكُمْ، اللَّهُمَّ اغْفِرْ لأَهْلِ بَقِيعِ الْغَرْقَدِ',
      transliteration: 'Assalamu \'alaykum daara qawmim-mu\'minin, wa inna in sya-Allahu bikum lahiquun. Yaghfirullahu lana wa lakum. Allahumma-ghfir li-ahli Baqi\'il-Gharqad.',
      translation: 'Salam sejahtera ke atas kamu wahai penghuni tempat kaum yang beriman. Sesungguhnya kami insya-Allah akan menyusuli kamu. Semoga Allah mengampunkan kami dan kamu. Ya Allah, ampunilah penghuni Baqi\' Al-Gharqad.',
      sunnahNote: 'Hadis Sahih Muslim: Rasulullah ﷺ sentiasa melawat Baqi\' dan mendoakan para penghuninya.'
    },
    actionText: 'Sampaikan Salam & Bersedia Naik Bas',
    actionIcon: '🤍',
    coordinates: { x: -138, z: 18 }
  },

  // ==========================================
  // ➤ ZIARAH LUAR MADINAH (Melintasi Dari Bas)
  // ==========================================
  {
    id: 'masjid_ijabah',
    number: 1,
    title: 'Masjid Ijabah',
    arabicTitle: 'مَسْجِد الإِجَابَة (مَسْجِد بَنِي مُعَاوِيَة)',
    category: 'luar_madinah_melintas',
    categoryLabel: 'Ziarah Luar Madinah (Bas)',
    transportType: 'bus_pass',
    transportBadge: '🚌 Memandang Dari Dalam Bas',
    shortDesc: 'Masjid tempat Nabi ﷺ berdoa tiga perkara penting untuk umat baginda.',
    historicalStory:
      'Dikenali juga sebagai Masjid Bani Muawiyah. Rasulullah ﷺ pernah menunaikan solat 2 rakaat di sini lalu memanjatkan doa yang panjang mengandungi 3 permohonan untuk umatnya: Pertama, memohon agar umat tidak dibinasakan dengan kelaparan/kemarau menyeluruh (dimakbulkan). Kedua, agar umat tidak dibinasakan dengan ditenggelamkan banjir besar (dimakbulkan). Ketiga, agar umat tidak bertelingkah sesama sendiri, namun permohonan ketiga ini tidak diizinkan sebagai ujian keimanan umat akhir zaman.',
    sunnahOrAdab:
      'Memandang dari tingkap bas dengan takzim dan berdoa memohon perlindungan daripada perpecahan ukhuwah sesama Islam.',
    dua: {
      id: 'dua_ijabah',
      stage: 'ziarah_luar_bus',
      title: 'Doa Menjaga Ukhuwah & Penyatuan Ummah',
      location: 'Masjid Ijabah (Dari Bas)',
      arabic: 'اللَّهُمَّ أَلِّفْ بَيْنَ قُلُوبِنَا، وَأَصْلِحْ ذَاتَ بَيْنِنَا، وَاهْدِنَا سُبُلَ السَّلاَمِ، وَنَجِّنَا مِنَ الظُّلُمَاتِ إِلَى النُّورِ',
      transliteration: 'Allahumma allif bayna qulubina, wa ashlih dzata baynina, wahdina subulas-salam, wa najjina minazh-zhulumati ilan-nuur.',
      translation: 'Ya Allah, tautkanlah antara hati-hati kami, damaikanlah perselisihan antara kami, tunjukilah kami jalan-jalan keselamatan, dan selamatkanlah kami dari kegelapan menuju cahaya yang terang.',
      sunnahNote: 'Dibaca sambil memandang Masjid Ijabah dari dalam bas.'
    },
    actionText: 'Melintasi & Hayati Sejarah',
    actionIcon: '🚌',
    coordinates: { x: -143, z: 10 }
  },
  {
    id: 'masjid_bilal',
    number: 2,
    title: 'Masjid Bilal',
    arabicTitle: 'مَسْجِد بِلَال بْن رَبَاح',
    category: 'luar_madinah_melintas',
    categoryLabel: 'Ziarah Luar Madinah (Bas)',
    transportType: 'bus_pass',
    transportBadge: '🚌 Memandang Dari Dalam Bas',
    shortDesc: 'Masjid yang memperingati muazzin pertama Rasulullah ﷺ, Bilal bin Rabah R.A.',
    historicalStory:
      'Terletak di selatan Masjid Nabawi. Dinamakan sempena Saidina Bilal bin Rabah R.A., hamba Habasyah yang dimerdekakan oleh Saidina Abu Bakar dan diangkat oleh Baginda ﷺ menjadi Muazzin pertama Islam kerana kemerduan suaranya dan keteguhan imannya (Ahadun Ahad). Selepas kewafatan Rasulullah ﷺ, Bilal tidak mampu lagi melaungkan azan di Madinah kerana linangan air mata mengenang Baginda.',
    sunnahOrAdab:
      'Menghayati ketinggian nilai persaudaraan Islam yang menolak diskriminasi kaum dan warna kulit.',
    dua: {
      id: 'dua_bilal',
      stage: 'ziarah_luar_bus',
      title: 'Doa Selepas Mendengar Seruan Azan',
      location: 'Masjid Bilal (Dari Bas)',
      arabic: 'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلاَةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
      transliteration: 'Allahumma Rabba haadzihid-da\'watit-tammah, was-shalatil-qaa-imah, aati Muhammadanil-wasilata wal-fadhilah, wab\'atshu maqaamam-mahmuda-lladzi wa\'adtah.',
      translation: 'Ya Allah, Tuhan yang memiliki seruan yang sempurna ini dan solat yang akan didirikan, kurniakanlah kepada Nabi Muhammad ﷺ wasilah (kedudukan tertinggi) dan kemuliaan, serta tempatkanlah Baginda di tempat yang terpuji yang telah Engkau janjikan.',
      sunnahNote: 'Sunnah dibaca oleh setiap muslim yang menghargai syiar azan.'
    },
    actionText: 'Melintasi & Teruskan Perjalanan Bas',
    actionIcon: '🚌',
    coordinates: { x: -145, z: 0 }
  },
  {
    id: 'masjid_jumaah',
    number: 3,
    title: 'Masjid Jumaah',
    arabicTitle: 'مَسْجِد الجُمُعَة (مَسْجِد عَاتِكَة)',
    category: 'luar_madinah_melintas',
    categoryLabel: 'Ziarah Luar Madinah (Bas)',
    transportType: 'bus_pass',
    transportBadge: '🚌 Memandang Dari Dalam Bas',
    shortDesc: 'Lokasi solat Jumaat yang pertama kali didirikan oleh Rasulullah ﷺ di Madinah.',
    historicalStory:
      'Semasa peristiwa hijrah dari Quba menuju ke Madinah, waktu solat Jumaat telah masuk ketika Baginda tiba di lembah Wadi Ranuna (perkampungan Bani Salim bin Auf). Di sinilah Rasulullah ﷺ mengimami kira-kira 100 orang sahabat menunaikan solat Jumaat yang pertama berserta khutbah pertama dalam sejarah Islam.',
    sunnahOrAdab:
      'Mengagungkan syiar solat Jumaat dan mendengar nasihat mutawwif tentang pengorbanan hijrah.',
    dua: {
      id: 'dua_jumaah',
      stage: 'ziarah_luar_bus',
      title: 'Selawat & Doa Keberkatan Hari Jumaat',
      location: 'Masjid Jumaah (Dari Bas)',
      arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
      transliteration: 'Allahumma shalli \'ala Muhammad wa \'ala aali Muhammad, kama shallayta \'ala Ibrahim wa \'ala aali Ibrahim, innaka Hamidum-Majid.',
      translation: 'Ya Allah, berilah selawat ke atas Nabi Muhammad dan ke atas keluarga Nabi Muhammad, sebagaimana Engkau telah memberi selawat ke atas Nabi Ibrahim dan keluarganya, sesungguhnya Engkau Maha Terpuji lagi Maha Mulia.',
      sunnahNote: 'Memperbanyakkan selawat Ibrahimiyyah.'
    },
    actionText: 'Melintasi & Lihat Melalui Bas',
    actionIcon: '🚌',
    coordinates: { x: -147, z: -10 }
  },
  {
    id: 'masjid_qiblatain',
    number: 4,
    title: 'Masjid Qiblatain (Dua Kiblat)',
    arabicTitle: 'مَسْجِد القِبْلَتَيْن',
    category: 'luar_madinah_melintas',
    categoryLabel: 'Ziarah Luar Madinah (Bas)',
    transportType: 'bus_pass',
    transportBadge: '🚌 Memandang Dari Dalam Bas',
    shortDesc: 'Masjid saksi peristiwa pertukaran arah kiblat dari Masjidil Aqsa ke Masjidil Haram (Kaabah).',
    historicalStory:
      'Pada bulan Syaaban tahun ke-2 Hijrah, ketika Rasulullah ﷺ mengimami solat zohor/asar bersama jemaah Bani Salamah menghadap Baitul Maqdis (Masjidil Aqsa), turunlah ayat suci Surah Al-Baqarah ayat 144: "Sesungguhnya Kami melihat wajahmu kerap menengadah ke langit, maka Kami palingkan engkau ke kiblat yang engkau sukai...". Serta-merta di pertengahan solat, Baginda berpusing 180 darjah menghadap ke arah Kaabah di Makkah tanpa memutuskan solat.',
    sunnahOrAdab:
      'Menghayati ketaatan mutlak para sahabat terhadap wahyu Allah dan Rasul-Nya tanpa ragu-ragu.',
    dua: {
      id: 'dua_qiblatain',
      stage: 'ziarah_luar_bus',
      title: 'Doa Ketaatan & Menghadap Kaabah',
      location: 'Masjid Qiblatain (Dari Bas)',
      arabic: 'فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ ۚ وَحَيْثُ مَا كُنتُمْ فَوَلُّوا وُجُوهَكُمْ شَطْرَهُ',
      transliteration: 'Fawalli wajhaka syathral-Masjidil-Haram, wa haytsu ma kuntum fawallu wujuuhakum syathrah.',
      translation: 'Palingkanlah mukamu ke arah Masjidil Haram (Kaabah), dan di mana sahaja kamu berada, palingkanlah mukamu ke arahnya.',
      sunnahNote: 'Surah Al-Baqarah: Ayat 144.'
    },
    actionText: 'Bas Meneruskan Perjalanan ke Masjid Quba',
    actionIcon: '🚌',
    coordinates: { x: -152, z: -20 }
  },

  // ==========================================
  // ➤ ZIARAH LUAR MADINAH (Turun & Bergambar/Solat)
  // ==========================================
  {
    id: 'masjid_quba',
    number: 5,
    title: 'Masjid Quba (Solat di Masjid)',
    arabicTitle: 'مَسْجِد قُبَاء (أَوَّل مَسْجِد أُسِّسَ عَلَى التَّقْوَى)',
    category: 'luar_madinah_turun',
    categoryLabel: 'Ziarah Luar Madinah (Turun & Solat)',
    transportType: 'bus_stop',
    transportBadge: '📸 Turun & Solat di Masjid',
    shortDesc: 'Masjid pertama dibina dalam Islam. Solat 2 rakaat di sini mendapat ganjaran seperti pahala satu Umrah!',
    historicalStory:
      'Rasulullah ﷺ membina Masjid Quba sebaik sahaja tiba di Madinah dalam peristiwa Hijrah sebelum melangkah masuk ke tengah kota. Sabda Rasulullah ﷺ: "Barangsiapa berwuduk di rumahnya kemudian datang ke Masjid Quba lalu mendirikan solat di dalamnya, maka baginya pahala seumpama pahala mengerjakan Umrah." (Hadis Riwayat Ibn Majah, dinilai Sahih). Baginda ﷺ sentiasa menziarahi Quba setiap hari Sabtu dengan menunggang unta atau berjalan kaki.',
    sunnahOrAdab:
      'Mengambil wuduk dengan sempurna sejak dari bilik hotel, masuk ke Masjid Quba dengan mendahulukan kaki kanan, dan menunaikan solat sunat 2 rakaat.',
    dua: {
      id: 'dua_quba',
      stage: 'ziarah_luar_bus',
      title: 'Niat Solat Sunat Tahiyyatul Masjid di Quba',
      location: 'Masjid Quba (Ruang Solat)',
      arabic: 'أُصَلِّي سُنَّةَ تَحِيَّةِ الْمَسْجِدِ رَكْعَتَيْنِ لِلَّهِ تَعَالَى',
      transliteration: 'Ushalli sunnata tahiyyatil-masjidi rak\'ataini lillahi Ta\'ala.',
      translation: 'Sahaja aku solat sunat tahiyyatul masjid dua rakaat kerana Allah Taala.',
      sunnahNote: 'Ganjaran solat di sini seumpama pahala satu Umrah yang lengkap!'
    },
    actionText: 'Solat Sunat 2 Rakaat & Bergambar',
    actionIcon: '🕌',
    coordinates: { x: -124, z: -35 }
  },
  {
    id: 'ladang_kurma',
    number: 6,
    title: 'Ladang Kurma (Bustaan An-Nakhl)',
    arabicTitle: 'مَزَارِع التُّمُور بِالمَدِينَة المُنَوَّرَة',
    category: 'luar_madinah_turun',
    categoryLabel: 'Ziarah Luar Madinah (Turun & Melawat)',
    transportType: 'bus_stop',
    transportBadge: '🌴 Turun & Melawat Ladang',
    shortDesc: 'Melawat kebun kurma asli Madinah, mencicipi kurma Ajwa (kurma Nabi), Safawi, dan Sukari.',
    historicalStory:
      'Madinah terkenal sejak zaman dahulu dengan hasil ladang kurma yang subur. Rasulullah ﷺ bersabda mengenai Kurma Ajwa Madinah: "Barangsiapa memakan tujuh biji kurma Ajwa pada waktu pagi, maka pada hari itu dia tidak akan dimudaratkan oleh racun mahupun sihir." (Hadis Riwayat Bukhari). Para jemaah berpeluang melihat sendiri pohon-pohon kurma yang berbuah lebat dan merasai kemanisan kurma segar.',
    sunnahOrAdab:
      'Membaca Bismillah sebelum makan, bersyukur atas nikmat rezeki, dan membeli kurma sebagai buah tangan untuk keluarga di tanah air.',
    dua: {
      id: 'dua_kurma',
      stage: 'ziarah_luar_bus',
      title: 'Doa Memohon Keberkatan Rezeki Buah-buahan Madinah',
      location: 'Ladang Kurma Madinah',
      arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِي ثَمَرِنَا، وَبَارِكْ لَنَا فِي مَدِينَتِنَا، وَبَارِكْ لَنَا فِي صَاعِنَا، وَبَارِكْ لَنَا فِي مُدِّنَا',
      transliteration: 'Allahumma baarik lanaa fii tsamarinaa, wa baarik lanaa fii madiinatinaa, wa baarik lanaa fii shaa\'inaa, wa baarik lanaa fii muddinaa.',
      translation: 'Ya Allah, berkatilah bagi kami pada buah-buahan kami, berkatilah kota Madinah kami, berkatilah pada sukatan gantang kami dan pada sukatan cupak kami.',
      sunnahNote: 'Doa Nabi ﷺ memohon keberkatan hasil tanaman Madinah (Sahih Muslim).'
    },
    actionText: 'Nikmati Kurma Ajwa & Teruskan',
    actionIcon: '🌴',
    coordinates: { x: -134, z: -45 }
  },
  {
    id: 'masjid_7_khandak',
    number: 7,
    title: 'Masjid 7 / Medan Peperangan Khandak',
    arabicTitle: 'مَسْجِد السَّبْعَة وَمَيْدَان غَزْوَة الخَنْدَق',
    category: 'luar_madinah_turun',
    categoryLabel: 'Ziarah Luar Madinah (Turun & Melawat)',
    transportType: 'bus_stop',
    transportBadge: '📸 Turun & Bergambar',
    shortDesc: 'Kawasan kaki Bukit Sila\', saksi strategi penggalian parit Salman Al-Farisi menangkis tentera Ahzab.',
    historicalStory:
      'Pada tahun ke-5 Hijrah, 10,000 tentera gabungan Musyrikin Quraisy, Ghatafan dan Yahudi mengepung Madinah (Perang Ahzab). Atas cadangan bijak sahabat Salman Al-Farisi R.A., Rasulullah ﷺ bersama 3,000 sahabat menggali parit besar (Khandak) sepanjang utara Madinah dalam cuaca sejuk mencengkam. Masjid 7 merujuk kepada kubu/pos kawalan para sahabat utama termasuk Pos Rasulullah ﷺ (Masjid Fath), Saidina Ali, Saidina Umar, Salman Al-Farisi, dan Abu Bakar.',
    sunnahOrAdab:
      'Mengambil iktibar daripada kesungguhan para sahabat bermusyawarah, berkorban tenaga, dan bertawakal penuh kepada pertolongan Allah.',
    dua: {
      id: 'dua_khandak',
      stage: 'ziarah_luar_bus',
      title: 'Doa Kemenangan Ahzab (Zikir Fath)',
      location: 'Medan Peperangan Khandak',
      arabic: 'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ، صَدَقَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَأَعَزَّ جُنْدَهُ، وَهَزَمَ الأَحْزَابَ وَحْدَهُ',
      transliteration: 'Laa ilaaha illallahu wahdah, shadaqa wa\'dah, wa nashara \'abdah, wa a\'azza jundah, wa hazamal-ahzaaba wahdah.',
      translation: 'Tiada Tuhan melainkan Allah yang Maha Esa, Yang menepati janji-Nya, menolong hamba-Nya, memuliakan tentera-Nya, dan mengalahkan tentera Ahzab dengan keagungan-Nya sendiri.',
      sunnahNote: 'Zikir kesyukuran atas kemenangan perang Khandak.'
    },
    actionText: 'Lihat Medan Khandak & Teruskan',
    actionIcon: '⚔️',
    coordinates: { x: -144, z: -50 }
  },
  {
    id: 'jabal_uhud_bukit_pemanah',
    number: 8,
    title: 'Jabal Uhud, Makam 70 Shuhada & Bukit Pemanah',
    arabicTitle: 'جَبَل أُحُد وَمَقْبَرَة الشُّهَدَاء وَجَبَل الرُّمَاة',
    category: 'luar_madinah_turun',
    categoryLabel: 'Ziarah Luar Madinah (Turun & Hayati)',
    transportType: 'bus_stop',
    transportBadge: '🏔️ Turun & Menziarahi Makam Shuhada',
    shortDesc: 'Bukit yang mencintai umat Islam, Makam penghulu syuhada Sayyidina Hamzah R.A., dan pengajaran Bukit Pemanah.',
    historicalStory:
      'Rasulullah ﷺ bersabda: "Sesungguhnya Bukit Uhud ini adalah bukit yang mencintai kami dan kami mencintainya." (Hadis Riwayat Bukhari). Di lembah Uhud berlakunya Perang Uhud (Tahun 3H). 50 orang pemanah yang diletakkan di Jabal Rumat (Bukit Pemanah) telah meninggalkan posisi mereka kerana menyangka perang sudah tamat, menyebabkan tentera berkuda Khalid bin Walid menyerang balas. 70 orang sahabat gugur syahid termasuk bapa saudara Nabi, Sayyidina Hamzah bin Abdul Muttalib (Asadullah - Singa Allah) dan Mus\'ab bin Umair.',
    sunnahOrAdab:
      'Menaiki sedikit kaki Jabal Rumat dengan cermat, memandang Makam Shuhada Uhud sambil memberi salam dan doa dengan rasa insaf mentaati perintah Rasulullah ﷺ.',
    dua: {
      id: 'dua_uhud',
      stage: 'ziarah_luar_bus',
      title: 'Salam Kepada Shuhada Uhud Termasuk Sayyidina Hamzah',
      location: 'Makam Shuhada Uhud (Kaki Bukit Pemanah)',
      arabic: 'السَّلاَمُ عَلَيْكُمْ يَا شُهَدَاءَ أُحُدٍ، السَّلاَمُ عَلَيْكَ يَا سَيِّدَ الشُّهَدَاءِ حَمْزَةَ بْنَ عَبْدِ الْمُطَّلِبِ، رَضِيَ اللَّهُ عَنْكُمْ وَأَرْضَاكُمْ',
      transliteration: 'Assalamu \'alaykum ya syuhadaa-a Uhud, Assalamu \'alayka ya sayyidasy-syuhadaa-i Hamzata-bna \'Abdil-Muththalib, radhiyallahu \'ankum wa ardhaakum.',
      translation: 'Salam sejahtera ke atas kamu wahai para pejuang Syuhada Uhud, salam ke atasmu wahai Penghulu Para Syuhada, Hamzah bin Abdul Muttalib. Semoga Allah meredai kamu sekalian dan memuliakan kedudukan kamu di syurga.',
      sunnahNote: 'Mendoakan para syuhada yang mengorbankan nyawa demi agama Islam.'
    },
    actionText: 'Beri Salam Shuhada & Teruskan',
    actionIcon: '🏔️',
    coordinates: { x: -152, z: -55 }
  },
  {
    id: 'ziarah_badar',
    number: 9,
    title: 'Ziarah Badar (Kisah Perang Badar Al-Kubra)',
    arabicTitle: 'بَدْر الكُبْرَى (يَوْم الفُرْقَان)',
    category: 'luar_madinah_melintas',
    categoryLabel: 'Ziarah Luar Madinah (Bas)',
    transportType: 'bus_pass',
    transportBadge: '🚌 Penerangan Mutawwif Dalam Bas',
    shortDesc: 'Mengimbau kisah pertempuran agung pertama dalam sejarah Islam pada 17 Ramadan tahun ke-2 Hijrah.',
    historicalStory:
      'Lembah Badar terletak sekitar 130 km ke barat daya Madinah. Dalam pertempuran ini, seramai 313 orang tentera Islam dengan kelengkapan serba kekurangan telah berhadapan dengan 1,000 tentera musyrikin Makkah yang lengkap bersenjata. Allah SWT menurunkan bala bantuan 1,000 malaikat yang dipimpin oleh Malaikat Jibril A.S., menganugerahkan kemenangan gemilang yang termaktub dalam Al-Quran sebagai Yaumul Furqan (hari pemisah antara kebenaran dan kebatilan).',
    sunnahOrAdab:
      'Mengambil inspirasi bahawa kejayaan dan pertolongan adalah hak mutlak Allah apabila hati ikhlas berjuang di jalan-Nya.',
    dua: {
      id: 'dua_badar',
      stage: 'ziarah_luar_bus',
      title: 'Zikir Kemenangan & Tawakal Badar',
      location: 'Perjalanan Bas Lembah Badar',
      arabic: 'وَمَا النَّصْرُ إِلاَّ مِنْ عِندِ اللَّهِ الْعَزِيزِ الْحَكِيمِ، حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ نِعْمَ الْمَوْلَى وَنِعْمَ النَّصِيرُ',
      transliteration: 'Wa man-nashru illaa min \'indillahil-\'Azizil-Hakim, hasbunallahu wa ni\'mal-wakil, ni\'mal-mawla wa ni\'man-nashir.',
      translation: 'Dan tiadalah kemenangan itu melainkan daripada Allah Yang Maha Perkasa lagi Maha Bijaksana. Cukuplah Allah menjadi Penolong kami, dan Dialah sebaik-baik Pelindung.',
      sunnahNote: 'Ayat penguat jiwa tentera Islam di medan Badar.'
    },
    actionText: 'Selesai Ziarah Luar Madinah',
    actionIcon: '⭐',
    coordinates: { x: -168, z: -40 }
  },

  // ==========================================
  // ➤ ZIARAH PILIHAN MADINAH (SR 60)
  // ==========================================
  {
    id: 'jejak_rasul_sahabat_pilihan',
    number: 10,
    title: 'Jejak Rasul & Sahabat (Ziarah Pilihan SR 60)',
    arabicTitle: 'آثَار السِّيرَة النَّبَوِيَّة وَآبَار المَدِينَة',
    category: 'ziarah_pilihan',
    categoryLabel: 'Ziarah Pilihan Madinah',
    transportType: 'bus_stop',
    transportBadge: '✨ Ziarah Pilihan (Tambahan SR 60)',
    shortDesc: 'Melawat tapak telaga-telaga bersejarah Nabi ﷺ: Bir Ghars, Bir Rumah (Telaga Uthman), dan perkampungan sirah.',
    historicalStory:
      'Pakej ziarah tambahan pilihan yang membawa jemaah menelusuri telaga Nabi ﷺ seperti Bir Ghars (telaga yang airnya disukai Baginda dan digunakan untuk memandikan jenazah mulia Baginda ﷺ mengikut wasiat), serta Bir Rumah yang dibeli oleh Saidina Uthman R.A. daripada pemilik yahudi lalu diwakafkan untuk seluruh penduduk Madinah hingga kini.',
    sunnahOrAdab:
      'Menghayati sedekah jariah yang pahalanya terus mengalir berabad-abad lamanya.',
    dua: {
      id: 'dua_wakaf',
      stage: 'ziarah_luar_bus',
      title: 'Doa Keberkatan Sedekah & Wakaf Jariah',
      location: 'Bir Rumah / Bir Ghars',
      arabic: 'اللَّهُمَّ تَقَبَّلْ مِنَّا وَاجْعَلْ أَعْمَالَنَا خَالِصَةً لِوَجْهِكَ الْكَرِيمِ، وَارْزُقْنَا صَدَقَةً جَارِيَةً تَنْفَعُنَا بَعْدَ الْمَمَاتِ',
      transliteration: 'Allahumma taqabbal minnaa waj\'al a\'maalanaa khaalishatan li-wajhikal-kariim, warzuqnaa shadaqatan jaariyatan tanfa\'unaa ba\'dal-mamaat.',
      translation: 'Ya Allah, terimalah daripada kami dan jadikanlah amalan kami ikhlas kerana wajah-Mu yang mulia, dan kurniakanlah kami sedekah jariah yang bermanfaat sesudah kami meninggal dunia.',
      sunnahNote: 'Doa keikhlasan wakaf seperti yang diamalkan Saidina Uthman R.A.'
    },
    actionText: 'Kembali ke Hotel untuk Persiapan Ihram',
    actionIcon: '🏨',
    coordinates: { x: -155, z: -10 }
  },

  // ==========================================
  // ➤ ZIARAH WIDA' & PERSIAPAN HOTEL MADINAH
  // ==========================================
  {
    id: 'ziarah_wida_madinah',
    number: 11,
    title: 'Ziarah Wida\' Madinah (Salam Perpisahan)',
    arabicTitle: 'زِيَارَة الوَدَاع لِرَسُولِ اللَّهِ ﷺ',
    category: 'ziarah_wida_hotel',
    categoryLabel: 'Ziarah Wida\' & Persiapan',
    transportType: 'walk',
    transportBadge: '🥺 Salam Perpisahan Dari Jauh',
    shortDesc: 'Memberi salam perpisahan dari jauh kepada Baginda Rasulullah ﷺ sebelum berangkat ke Makkah Al-Mukarramah.',
    historicalStory:
      'Sebelum meninggalkan Kota Suci Madinah Al-Munawwarah, jemaah disunatkan melakukan Ziarah Wida\' (ziarah perpisahan) dengan memberi salam penuh keharuan kepada junjungan besar Nabi Muhammad ﷺ. Mengucapkan terima kasih atas syafaat dan jemputan ziarah, serta memohon agar Allah tidak menjadikan kunjungan ini sebagai yang terakhir ke makam Nabi tercinta.',
    sunnahOrAdab:
      'Menghadap ke arah Makam Rasulullah ﷺ dari kejauhan dengan tenang, menitiskan air mata syukur, dan memohon keampunan.',
    dua: {
      id: 'dua_wida',
      stage: 'ziarah_wida_hotel',
      title: 'Doa Ziarah Wida\' Madinah',
      location: 'Masjid Nabawi (Pintu Keluar)',
      arabic: 'اللَّهُمَّ لاَ تَجْعَلْ هَذَا آخِرَ الْعَهْدِ بِحَرَمِ رَسُولِكَ ﷺ، وَيَسِّرْ لِيَ الْعَوْدَ إِلَيْهِ سَالِمًا غَانِمًا يَا أَرْحَمَ الرَّاحِمِينَ',
      transliteration: 'Allahumma laa taj\'al haadza aakhirul-\'ahdi biharami Rasulika SAW, wa yassir liyal-\'awda ilayhi saaliman ghaanimaa ya Arhamar-Rahimin.',
      translation: 'Ya Allah, janganlah Engkau jadikan ziarah ini sebagai kali yang terakhir bagiku di tanah haram Rasul-Mu ﷺ. Permudahkanlah bagiku untuk kembali lagi ke sini dalam keadaan selamat dan mendapat ganjaran, wahai Tuhan Yang Maha Mengasihani.',
      sunnahNote: 'Dibaca dengan linangan air mata rindu sebelum keluar meninggalkan Madinah.'
    },
    actionText: 'Menuju ke Hotel untuk Mandi & Pakai Ihram',
    actionIcon: '🧳',
    coordinates: { x: -138, z: 15 }
  },
  {
    id: 'memakai_ihram_hotel',
    number: 12,
    title: 'Memakai Ihram dari Hotel di Madinah',
    arabicTitle: 'الإِحْرَام مِنَ الفُنْدُق بِالمَدِينَة المُنَوَّرَة',
    category: 'ziarah_wida_hotel',
    categoryLabel: 'Persiapan Memakai Ihram',
    transportType: 'hotel',
    transportBadge: '🧕 Persiapan di Hotel Penginapan',
    shortDesc: 'Mandi sunat ihram, bersiap, memakai kain ihram putih bagi lelaki / menutup aurat bagi wanita sebelum menaiki bas ke Miqat. Perhatikan hukum cawat & wangian ihram wanita!',
    historicalStory:
      'Di bilik hotel Madinah, jemaah melakukan persiapan sunat Ihram: memotong kuku, mencukur bulu ari-ari, merapikan janggut/misai, mandi sunat ihram, dan memakai wangi-wangian di badan. Kaum lelaki memakai dua helai kain putih tidak berjahit (Izar di pinggang, Rida\' di bahu) dan memakai selipar yang menampakkan jejari kaki. Kaum wanita memakai pakaian sopan menutup aurat sepenuhnya (kecuali muka dan tapak tangan).\n\n⚠️ NOTA TAMBAHAN LARANGAN IHRAM (PANDUAN KHAS FIQH & DAM):\n1. HUKUM MEMAKAI CAWAT / PELAPIK SEMASA BERIHRAM:\n• Sekiranya jemaah (terutamanya lelaki yang mempunyai keuzuran seperti kencing tidak lawas, buasir, luka atau sebagainya) perlu memakai kain cawat/pelapik/lampin: TIDAK BOLEH DIIKAT MATI (simpul mati / \'uqdah muhkamah).\n• Wajib/perlu dibuat SIMPUL MUDAH BUKA (seperti ikatan rama-rama / butterfly knot), atau disemat/diselitkan tanpa ikatan mati, agar tidak dihukumkan menyerupai pakaian berjahit/bercantum yang dilarang bagi lelaki dalam ihram.\n\n2. HUKUM WANGI-WANGIAN PADA PAKAIAN IHRAM WANITA:\n• Bagi jemaah wanita yang mengenakan wangi-wangian pada kain/baju ihram sebelum berniat ihram: Bau yang berkekalan dimaafkan selagi pakaian itu terus dipakai pada badan.\n• Namun pakaian tersebut TIDAK BOLEH dibuka atau ditanggalkan selepas berniat ihram jika ingin memakainya semula.\n• Sekiranya pakaian berwangian itu dibuka/ditanggalkan (contohnya mandi atau ke tandas), ia TIDAK BOLEH dipakai semula sama sekali (kerana memakai semula dikira memulakan pemakaian wangi-wangian baharu semasa dalam ihram yang mewajibkan Dam).\n• Justeru, jika dibuka, jemaah wanita PERLU menukar kepada baju/pakaian baharu yang bersih dan tidak berbau wangi!',
    sunnahOrAdab:
      'Menjaga kekemasan kain ihram. Bagi yang memakai cawat, pastikan dibuat simpul mudah buka (butterfly knot) dan jangan sesekali diikat mati. Bagi wanita, jika pakaian ihram terkena wangian sebelum niat, jangan sesekali membuka baju itu selepas niat; jika terpaksa dibuka, wajib tukar baju baharu yang tidak berwangian.',
    dua: {
      id: 'dua_mandi_ihram',
      stage: 'ziarah_wida_hotel',
      title: 'Niat Mandi Sunat Ihram',
      location: 'Bilik Hotel di Madinah',
      arabic: 'نَوَيْتُ غُسْلَ الإِحْرَامِ سُنَّةً لِلَّهِ تَعَالَى',
      transliteration: 'Nawaytu ghuslal-ihrami sunnatan lillahi Ta\'ala.',
      translation: 'Sahaja aku mandi sunat ihram kerana Allah Taala.',
      sunnahNote: 'Sunnah dilakukan sebelum menyarungkan pakaian ihram.'
    },
    actionText: 'Menaiki Bas Menuju ke Miqat Bir Ali',
    actionIcon: '🚌',
    coordinates: { x: -140, z: 22 }
  },

  // ==========================================
  // ➤ BERTOLAK KE MAKKAH & MIQAT DI MASJID BIR ALI
  // ==========================================
  {
    id: 'miqat_masjid_bir_ali',
    number: 13,
    title: 'Miqat di Masjid Bir Ali (Dzulhulaifah)',
    arabicTitle: 'مِيقَات مَسْجِد ذِي الحُلَيْفَة (آبَار عَلِي)',
    category: 'miqat_bir_ali',
    categoryLabel: 'MIQAT & Niat Umrah',
    transportType: 'miqat',
    transportBadge: '🕌 MIQAT Umrah Pertama (Wajib)',
    shortDesc: 'Stesen Miqat makani bagi jemaah dari Madinah. Solat sunat ihram 2 rakaat dan melafazkan Niat Umrah. 13 Pantang larang ihram berkuat kuasa serta-merta!',
    historicalStory:
      'Terletak kira-kira 11 km di selatan Madinah. Ini adalah Miqat yang telah ditetapkan sendiri oleh Baginda Rasulullah ﷺ bagi penduduk Madinah dan sesiapa yang melaluinya (seperti jemaah Malaysia yang mendarat di Madinah). Setiap orang yang berniat mengerjakan Umrah WAJIB berniat di sini sebelum melepasi sempadan Miqat ini ke Makkah. Jika terlepas tanpa niat, wajib berpatah balik atau dikenakan Dam (denda).\n\n⚠️ PERINGATAN 13 PANTANG LARANG IHRAM BERKUAT KUASA:\nSebaik sahaja niat dilafazkan, 13 perkara menjadi haram: (1) Pakaian berjahit/bercantum bagi lelaki, (2) Tutup kepala bagi lelaki, (3) Tutup muka bagi wanita, (4) Sarung tangan, (5) Memakai wangi-wangian, (6) Minyak rambut/janggut, (7) Cabut/potong rambut atau bulu, (8) Kerat kuku, (9) Tebang pokok Tanah Haram, (10) Memburu binatang, (11) Akad nikah, (12) Mukadimah jimak, (13) Jimak.\n\n*Peringatan Cawat: Pastikan simpul mudah buka (butterfly), jangan simpul mati!\n*Peringatan Wangian Wanita: Baju berwangian jangan dibuka selepas niat; jika dibuka, wajib tukar baju baharu!',
    sunnahOrAdab:
      'Mengambil wuduk, masuk ke Masjid Bir Ali, mendirikan Solat Sunat Ihram 2 rakaat (Rakaat 1 baca Surah Al-Kafirun, Rakaat 2 baca Surah Al-Ikhlas), kemudian melafazkan Niat Umrah di dalam hati dan lidah. Semak semula pakaian: tiada jahitan/cantuman bagi lelaki, cawat diikat simpul mudah buka, dan wangian wanita dipatuhi.',
    dua: {
      id: 'niat_umrah_bir_ali',
      stage: 'miqat_bir_ali',
      title: 'Lafaz Niat Ihram Umrah & Niat Bersyarat',
      location: 'Masjid Bir Ali (Dzulhulaifah)',
      arabic: 'نَوَيْتُ الْعُمْرَةَ وَأَحْرَمْتُ بِهَا لِلَّهِ تَعَالَى، اللَّهُمَّ مَحِلِّي حَيْثُ حَبَسْتَنِي',
      transliteration: 'Nawaytul-\'umrata wa ahramtu bihaa lillahi Ta\'ala. Allahumma mahillii haytsu habastanii.',
      translation: 'Sahaja aku berniat ihram umrah dan berihram aku dengannya kerana Allah Taala. Ya Allah, tempat tahallulku adalah di mana sahaja Engkau menahanku (jika ada halangan syar\'i).',
      sunnahNote: 'Lafaz niat wajib disertai lintasan hati: "Sahaja aku mengerjakan umrah dan berihram aku dengannya kerana Allah Taala." Pantang larang ihram kini berkuat kuasa sepenuhnya.'
    },
    actionText: 'Lafaz Niat Umrah & Naik Semula Bas',
    actionIcon: '🕋',
    coordinates: { x: -148, z: 32 }
  },

  // ==========================================
  // ➤ PERJALANAN BAS BERTALBIYAH KE MAKKAH
  // ==========================================
  {
    id: 'perjalanan_bas_talbiyah_makkah',
    number: 14,
    title: 'Bertolak ke Makkah Sambil Bertalbiyah (450 KM)',
    arabicTitle: 'الانْطِلَاق إِلَى مَكَّة المُكَرَّمَة مَعَ التَّلْبِيَة',
    category: 'perjalanan_makkah',
    categoryLabel: 'Perjalanan Lebuhraya Hijrah',
    transportType: 'bus_travel',
    transportBadge: '🚌 Perjalanan Bas Beramai-ramai',
    shortDesc: 'Menaiki bas merentasi Lebuhraya Hijrah (Madinah-Makkah) sambil seluruh jemaah bersemangat mengalunkan Talbiyah. Memahami waktu mula & tamat Talbiyah bagi Umrah & Haji.',
    historicalStory:
      'Perjalanan dari Madinah ke Makkah mengambil masa kira-kira 5 hingga 6 jam melalui lebuh raya padang pasir (450 KM). Sejak berniat ihram di Masjid Bir Ali, jemaah rasmi berada dalam ihram.\n\n' +
      '📌 WAKTU MEMBACA TALBIYAH UNTUK UMRAH:\n' +
      '• Mula: Ketika seseorang telah berniat ihram di miqat.\n' +
      '• Tamat: Ketika mulai memasuki ibadah Tawaf (sebelum menyentuh/mengucap salam pada Hajar Aswad atau memulai putaran pertama tawaf).\n\n' +
      '📌 WAKTU MEMBACA TALBIYAH UNTUK HAJI:\n' +
      '• Mula: Ketika seseorang telah berniat ihram haji di miqat.\n' +
      '• Tamat: Berakhir ketika mulai melempar Jumrah al-Kubra (Jumrah Aqabah) pada tanggal 10 Zulhijah (Hari Raya Aidiladha), atau saat mulai tawaf atau bercukur mengikut mana yang didahulukan.\n\n' +
      '⚖️ HUKUM & CARA MELAFAZKAN:\n' +
      '• Hukum: Sunat muakkad (mustahab). Jika terlupa atau tertinggal, ia tidak membatalkan ibadah haji atau umrah.\n' +
      '• Bagi jemaah lelaki, disunatkan mengerjakannya dengan suara yang nyaring, manakala bagi jemaah wanita, dibaca dengan suara perlahan yang hanya didengari oleh diri sendiri.',
    sunnahOrAdab:
      'Disunatkan membaca talbiyah (sunat muakkad). Menyaringkan suara bertalbiyah bagi lelaki dan merendahkan suara bagi wanita. Menjaga lisan, emosi dan kesabaran sepanjang perjalanan.',
    dua: {
      id: 'talbiyah_perjalanan',
      stage: 'perjalanan_makkah',
      title: 'Lafaz Agung Talbiyah Sepanjang Perjalanan',
      location: 'Dalam Bas (Lebuhraya Hijrah)',
      arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ',
      transliteration: 'Labbaik Allahumma labbaik, labbaika laa syariika laka labbaik. Innal-hamda wan-ni\'mata laka wal-mulk, laa syariika lak.',
      translation: 'Hamba-Mu datang menyahut panggilan-Mu ya Allah, hamba-Mu datang. Tiada sekutu bagi-Mu, hamba-Mu datang. Sesungguhnya segala puji, nikmat dan kerajaan adalah milik-Mu semata-mata, tiada sekutu bagi-Mu.',
      sunnahNote: 'Membaca talbiyah adalah sunat muakkad (mustahab). Dilaungkan dengan suara nyaring bagi lelaki dan perlahan bagi wanita bermula dari niat ihram sehingga mula melangkah ke tawaf.',
      waktuUmrah: {
        mula: 'Ketika seseorang telah berniat ihram di miqat.',
        tamat: 'Ketika mulai memasuki ibadah Tawaf (sebelum menyentuh/mengucap salam pada Hajar Aswad atau memulai putaran pertama tawaf).'
      },
      waktuHaji: {
        mula: 'Ketika seseorang telah berniat ihram haji di miqat.',
        tamat: 'Berakhir ketika mulai melempar Jumrah al-Kubra (Jumrah Aqabah) pada tanggal 10 Zulhijah (Hari Raya Aidiladha), atau saat mulai tawaf atau bercukur mengikut mana yang didahulukan.'
      },
      hukumDanKetentuan: {
        hukum: 'Membaca talbiyah adalah sunat muakkad (mustahab). Jika terlupa atau tertinggal, ia tidak membatalkan ibadah haji atau umrah.',
        caraMelafazkan: 'Bagi jemaah lelaki, disunatkan mengerjakannya dengan suara yang nyaring, manakala bagi jemaah wanita, dibaca dengan suara perlahan yang hanya didengari oleh diri sendiri.'
      },
      audioUrl: './audio/talbiyah.mp3'
    },
    actionText: 'Tiba di Makkah & Menuju Masjidil Haram',
    actionIcon: '🕋',
    coordinates: { x: -140, z: 65 }
  },

  // ==========================================
  // ➤ TIBA DI MAKKAH (MASJIDIL HARAM)
  // ==========================================
  {
    id: 'tiba_di_makkah_tawaf',
    number: 15,
    title: 'Tiba di Makkah: Tawaf & Saie Berkumpulan',
    arabicTitle: 'الوُصُول إِلَى مَكَّة المُكَرَّمَة (بَدْء الطَّوَاف)',
    category: 'perjalanan_makkah',
    categoryLabel: 'Tiba di Masjidil Haram',
    transportType: 'walk',
    transportBadge: '🕋 Tawaf Kaabah 7 Pusingan',
    shortDesc: 'Tiba di Masjidil Haram di bawah bimbingan mutawwif untuk melaksanakan Tawaf 7 Pusingan bermula dari Hajarul Aswad.',
    historicalStory:
      'Alhamdulillah! Bas selamat tiba di Kota Suci Makkah Al-Mukarramah. Jemaah melangkah masuk ke Masjidil Haram melalui pintu Babus Salam / Bab Abdul Aziz dengan penuh takzim. Sebaik sahaja memandang Kaabah Al-Musyarafah, jemaah berdoa lalu berarak menuju garisan Hajarul Aswad untuk memulakan rukun Tawaf 7 pusingan, solat sunat tawaf di Maqam Ibrahim, minum air Zamzam, Sa\'i 7 pusingan antara Safa dan Marwah, dan berakhir dengan Tahallul.',
    sunnahOrAdab:
      'Melangkah masuk dengan kaki kanan, berdoa memohon keampunan, memandang Kaabah dengan linangan air mata syukur, dan sentiasa berada dalam rombongan mutawwif.',
    dua: {
      id: 'dua_melihat_kaabah',
      stage: 'tawaf',
      title: 'Doa Ketika Mula-mula Melihat Kaabah',
      location: 'Masjidil Haram (Dataran Mataf)',
      arabic: 'اللَّهُمَّ زِدْ هَذَا الْبَيْتَ تَشْرِيفًا وَتَعْظِيمًا وَتَكْرِيمًا وَمَهَابَةً، وَزِدْ مَنْ شَرَّفَهُ وَعَظَّمَهُ مِمَّنْ حَجَّهُ أَوِ اعْتَمَرَهُ تَشْرِيفًا وَتَكْرِيمًا وَتَعْظِيمًا وَبِرًّا',
      transliteration: 'Allahumma zid haadzal-baita tasyriifan wa ta\'zhiiman wa takriiman wa mahaabah, wa zid man syarrafahu wa \'azzhamahu mimman hajjahu awi\'tamarahu tasyriifan wa takriiman wa ta\'zhiiman wa birraa.',
      translation: 'Ya Allah, tambahkanlah kemuliaan, keagungan, kehormatan dan kehebatan bagi Rumah ini (Baitullah). Dan tambahkanlah kemuliaan, kehormatan, keagungan dan kebajikan bagi orang-orang yang memuliakannya daripada kalangan yang menunaikan haji atau umrah.',
      sunnahNote: 'Doa mustajab ketika pertama kali melihat Kaabah sebelum memulakan Tawaf.'
    },
    actionText: 'Mula Tawaf Pusingan Pertama di Hajarul Aswad',
    actionIcon: '🕋',
    coordinates: { x: 18, z: 18 }
  }
];
