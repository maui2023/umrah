import { DuaItem } from '../types';

export const TALBIYAH_DUA: DuaItem = {
  id: 'talbiyah',
  stage: 'niat',
  title: 'Lafaz & Panduan Talbiyah',
  location: 'Miqat & Sepanjang Perjalanan ke Makkah',
  arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ',
  transliteration: 'Labbaik Allahumma labbaik, labbaika laa syariika laka labbaik. Innal-hamda wan-ni\'mata laka wal-mulk, laa syariika lak.',
  translation: 'Hamba-Mu datang menyahut panggilan-Mu ya Allah, hamba-Mu datang. Tiada sekutu bagi-Mu, hamba-Mu datang. Sesungguhnya segala puji, nikmat dan kerajaan adalah milik-Mu semata-mata, tiada sekutu bagi-Mu.',
  sunnahNote: 'Membaca talbiyah adalah sunat muakkad (mustahab). Disunatkan bertalbiyah dengan suara nyaring bagi jemaah lelaki, dan suara perlahan bagi jemaah wanita.',
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
};

export const NIAT_UMRAH: DuaItem = {
  id: 'niat_ihram',
  stage: 'niat',
  title: 'Niat Mengerjakan Umrah',
  location: 'Miqat',
  arabic: 'نَوَيْتُ الْعُمْرَةَ وَأَحْرَمْتُ بِهَا لِلَّهِ تَعَالَى',
  transliteration: 'Nawaytul-\'umrata wa ahramtu biha lillahi Ta\'ala.',
  translation: 'Sahaja aku berniat ihram umrah dan berihram aku dengannya kerana Allah Ta\'ala.',
  sunnahNote: 'Lelaki memakai 2 helai kain ihram putih tidak berjahit. Wanita menutup seluruh aurat kecuali muka dan kedua tapak tangan.'
};

export const ISTILAM_DUA: DuaItem = {
  id: 'istilam',
  stage: 'tawaf',
  title: 'Istilam Hajarul Aswad (Permulaan Pusingan)',
  location: 'Garisan Hajarul Aswad',
  arabic: 'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ، اللَّهُمَّ إِيمَانًا بِكَ وَتَصْدِيقًا بِكِتَابِكَ وَوَفَاءً بِعَهْدِكَ وَاتِّبَاعًا لِسُنَّةِ نَبِيِّكَ مُحَمَّدٍ ﷺ',
  transliteration: 'Bismillahi Allahu Akbar, Allahumma iimanan bika wa tashdiqan bikitaabika wa wafa\'an bi\'ahdika wattiba\'an lisunnati Nabiyyika Muhammadin SAW.',
  translation: 'Dengan nama Allah dan Allah Maha Besar. Ya Allah, demi keimanan kepada-Mu, membenarkan kitab-Mu, menepati janji-Mu dan mengikut sunnah Nabi-Mu Muhammad ﷺ.',
  sunnahNote: 'Mengangkat tangan kanan menghadap Hajarul Aswad dari garisan permulaan tanpa perlu berebut atau mencium jika sesak.'
};

export const RUKUN_YAMANI_DUA: DuaItem = {
  id: 'rukun_yamani',
  stage: 'tawaf',
  title: 'Doa Antara Rukun Yamani & Hajarul Aswad',
  location: 'Rukun Yamani ke Hajarul Aswad',
  arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ، وَأَدْخِلْنَا الْجَنَّةَ مَعَ الأَبْرَارِ، يَا عَزِيزُ يَا غَفَّارُ',
  transliteration: 'Rabbana aatina fid-dunya hasanah, wa fil-aakhirati hasanah, wa qinaa \'adzaban-naar, wa adkhilnal-jannata ma\'al-abraar, ya \'Aziizu ya Ghaffaar.',
  translation: 'Wahai Tuhan kami, berikanlah kami kebaikan di dunia dan kebaikan di akhirat, dan peliharalah kami daripada azab neraka. Dan masukkanlah kami ke syurga bersama orang-orang soleh.',
  sunnahNote: 'Sunnah dibaca berulang-ulang di antara Rukun Yamani dan Hajarul Aswad pada setiap pusingan Tawaf.'
};

export const TAWAF_DUAS: Record<number, DuaItem> = {
  1: {
    id: 'tawaf_1',
    stage: 'tawaf',
    lap: 1,
    title: 'Doa Tawaf: Pusingan Pertama',
    location: 'Dataran Kaabah (Pusingan 1)',
    arabic: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
    transliteration: 'Subhanallah, walhamdulillah, wa laa ilaaha illallah, wallahu akbar, wa laa hawla wa laa quwwata illa billahil-\'aliyyil-\'azhiim.',
    translation: 'Maha Suci Allah, segala puji bagi Allah, tiada Tuhan melainkan Allah, Allah Maha Besar, dan tiada daya upaya melainkan dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung.',
    sunnahNote: 'Sunnah Idtiba\' (bahu kanan terbuka) dan Raml (berlari-lari anak) bagi kaum lelaki pada 3 pusingan pertama.'
  },
  2: {
    id: 'tawaf_2',
    stage: 'tawaf',
    lap: 2,
    title: 'Doa Tawaf: Pusingan Kedua',
    location: 'Dataran Kaabah (Pusingan 2)',
    arabic: 'اللَّهُمَّ إِنَّ هَذَا الْبَيْتَ بَيْتُكَ، وَالْحَرَمَ حَرَمُكَ، وَالأَمْنَ أَمْنُكَ، وَالْعَبْدَ عَبْدُكَ، وَهَذَا مَقَامُ الْعَائِذِ بِكَ مِنَ النَّارِ',
    transliteration: 'Allahumma inna haadzal-baita baituka, wal-harama haramuka, wal-amna amnuka, wal-\'abda \'abduka, wa haadza maqaamul-\'a-idzi bika minan-naar.',
    translation: 'Ya Allah, sesungguhnya Baitullah ini adalah rumah-Mu, tanah haram ini tanah haram-Mu, keamanan ini adalah keamanan-Mu, dan kami ini hamba-Mu yang memohon perlindungan dari api neraka.',
    sunnahNote: 'Teruskan berzikir dan menghadap ke arah hadapan dengan Kaabah sentiasa di sebelah kiri anda.'
  },
  3: {
    id: 'tawaf_3',
    stage: 'tawaf',
    lap: 3,
    title: 'Doa Tawaf: Pusingan Ketiga',
    location: 'Dataran Kaabah (Pusingan 3)',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الشَّكِّ وَالشِّرْكِ، وَالشِّقَاقِ وَالنِّفَاقِ، وَسُوءِ الأَخْلاَقِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالأَهْلِ وَالْوَلَدِ',
    transliteration: 'Allahumma inni a\'uudzu bika minasy-syakki wasy-syirki, wasy-syiqaaqi wan-nifaaqi, wa suu-il akhlaaq, wa suu-il munqalabi fil-maali wal-ahli wal-walad.',
    translation: 'Ya Allah, hamba memohon perlindungan-Mu dari syak ragu, syirik, perpecahan, nifaq, budi pekerti yang buruk, serta keburukan saat kembali kepada harta, keluarga dan zuriat.',
    sunnahNote: 'Pusingan terakhir bagi sunnah Raml (berlari anak). Pusingan ke-4 hingga ke-7 berjalan seperti biasa.'
  },
  4: {
    id: 'tawaf_4',
    stage: 'tawaf',
    lap: 4,
    title: 'Doa Tawaf: Pusingan Keempat',
    location: 'Dataran Kaabah (Pusingan 4)',
    arabic: 'اللَّهُمَّ اجْعَلْهُ حَجًّا مَبْرُورًا، وَسَعْيًا مَشْكُورًا، وَذَنْبًا مَغْفُورًا، وَعَمَلاً صَالِحًا مَقْبُولاً، وَتِجَارَةً لَنْ تَبُورَ',
    transliteration: 'Allahummaj\'alhu hajjan mabruuraa, wa sa\'yan masjkuuraa, wa dzanban maghfuuraa, wa \'amalan shaalihan maqbuulaa, wa tijaaratan lan tabuur.',
    translation: 'Ya Allah, jadikanlah ibadah ini haji & umrah yang mabrur, sa\'i yang disyukuri, dosa yang diampuni, amal soleh yang diterima, dan perniagaan yang tidak akan rugi.',
    sunnahNote: 'Berjalan dengan tenang dan tertib, perbanyakkan doa untuk kedua ibu bapa.'
  },
  5: {
    id: 'tawaf_5',
    stage: 'tawaf',
    lap: 5,
    title: 'Doa Tawaf: Pusingan Kelima',
    location: 'Dataran Kaabah (Pusingan 5)',
    arabic: 'اللَّهُمَّ أَظِلَّنِي تَحْتَ ظِلِّ عَرْشِكَ يَوْمَ لاَ ظِلَّ إِلاَّ ظِلُّكَ، وَلاَ بَاقِيَ إِلاَّ وَجْهُكَ، وَاسْقِنِي مِنْ حَوْضِ نَبِيِّكَ مُحَمَّدٍ ﷺ شَرْبَةً لاَ أَظْمَأُ بَعْدَهَا أَبَدًا',
    transliteration: 'Allahumma azhillani tahta zhilli \'arsyika yawma laa zhilla illaa zhilluk, wa laa baaqiya illaa wajhuk, wasqini min hawdhi Nabiyyika Muhammadin SAW syarbatan laa azhma-u ba\'dahaa abadaa.',
    translation: 'Ya Allah, naungilah aku di bawah naungan Arasy-Mu pada hari yang tiada naungan selain naungan-Mu, dan berilah aku minum dari telaga Nabi-Mu Muhammad ﷺ dengan minuman yang aku tidak akan dahaga selamanya.',
    sunnahNote: 'Sentiasa perhatikan kedudukan Kaabah kekal di sebelah kiri bahu.'
  },
  6: {
    id: 'tawaf_6',
    stage: 'tawaf',
    lap: 6,
    title: 'Doa Tawaf: Pusingan Keenam',
    location: 'Dataran Kaabah (Pusingan 6)',
    arabic: 'اللَّهُمَّ إِنَّ لَكَ عَلَيَّ حُقُوقًا كَثِيرَةً فِيمَا بَيْنِي وَبَيْنَكَ، وَحُقُوقًا كَثِيرَةً فِيمَا بَيْنِي وَبَيْنَ خَلْقِكَ، اللَّهُمَّ مَا كَانَ لَكَ مِنْهَا فَاغْفِرْهُ لِي',
    transliteration: 'Allahumma inna laka \'alayya huquuqan katsiiratan fiimaa baini wa bainaka, wa huquuqan katsiiratan fiimaa baini wa baina khalqik, Allahumma maa kaana laka minhaa faghfir-hu lii.',
    translation: 'Ya Allah, sesungguhnya Engkau mempunyai banyak hak atasku antara aku dan Engkau, dan antara aku dan makhluk-Mu. Maka ampunilah hak-Mu atasku dan maafkanlah kesalahanku terhadap hamba-Mu.',
    sunnahNote: 'Tingkatkan tumpuan dan keikhlasan hati menjelang tamat pusingan.'
  },
  7: {
    id: 'tawaf_7',
    stage: 'tawaf',
    lap: 7,
    title: 'Doa Tawaf: Pusingan Ketujuh (Terakhir)',
    location: 'Dataran Kaabah (Pusingan 7)',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ إِيمَانًا كَامِلاً، وَيَقِينًا صَادِقًا، وَرِزْقًا وَاسِعًا، وَقَلْبًا خَاشِعًا، وَلِسَانًا ذَاكِرًا، وَتَوْبَةً نَصُوحًا قَبْلَ الْمَوْتِ',
    transliteration: 'Allahumma inni as-aluka iimaanan kaamilaa, wa yaqiinan shaadiqa, wa rizqan waasi\'aa, wa qalban khaasyi\'aa, wa lisaanan dzaakiraa, wa tawbatan nashuuha qablal-mawt.',
    translation: 'Ya Allah, sesungguhnya aku memohon keimanan yang sempurna, keyakinan yang benar, rezeki yang luas, hati yang khusyuk, lidah yang sentiasa berzikir, dan taubat nasuha sebelum maut.',
    sunnahNote: 'Selepas selesai pusingan ke-7 di Hajarul Aswad, tutup semula kedua-dua bahu bagi lelaki dan bergerak menuju Maqam Ibrahim.'
  }
};

export const MAQAM_IBRAHIM_DUA: DuaItem = {
  id: 'maqam_ibrahim',
  stage: 'solat_zamzam',
  title: 'Solat Sunat Tawaf di Belakang Maqam Ibrahim',
  location: 'Belakang Maqam Ibrahim',
  arabic: 'وَاتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى',
  transliteration: 'Wattakhidzuu mim-maqaami Ibraahiima mushalla.',
  translation: 'Dan jadikanlah sebahagian daripada Maqam Ibrahim itu tempat solat. (Surah Al-Baqarah: 125)',
  sunnahNote: 'Lakukan solat sunat 2 rakaat: Rakaat 1 baca Surah Al-Kafirun, Rakaat 2 baca Surah Al-Ikhlas.'
};

export const ZAMZAM_DUA: DuaItem = {
  id: 'zamzam',
  stage: 'solat_zamzam',
  title: 'Doa Minum Air Zamzam',
  location: 'Stesen Air Zamzam',
  arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا وَاسِعًا، وَشِفَاءً مِنْ كُلِّ دَاءٍ وَسَقَمٍ، بِرَحْمَتِكَ يَا أَرْحَمَ الرَّاحِمِينَ',
  transliteration: 'Allahumma inni as-aluka \'ilman naafi\'aa, wa rizqan waasi\'aa, wa syifaa-an min kulli daa-in wa saqam, birahmatika ya Arhamar-Raahimiin.',
  translation: 'Ya Allah, daku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang luas, dan kesembuhan dari segala penyakit, dengan rahmat-Mu wahai Tuhan yang Maha Mengasihani.',
  sunnahNote: 'Minum dalam keadaan menghadap kiblat dengan membaca Bismillah dan berniat hajat kebaikan.'
};

export const SAFA_START_DUA: DuaItem = {
  id: 'safa_start',
  stage: 'sai',
  title: 'Mendaki Bukit Safa (Permulaan Sa\'i)',
  location: 'Puncak Bukit Safa',
  arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ ۖ فَمَنْ حَجَّ الْبَيْتَ أَوِ اعْتَمَرَ فَلَا جُنَاحَ عَلَيْهِ أَن يَطَّوَّفَ بِهِمَا ۚ نَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ',
  transliteration: 'Innash-shafaa wal-marwata min sya\'aa-irillah. Faman hajjal-baita awi\'tamara falaa junaaha \'alaihi ay-yaththawwafa bihimaa. Nabda-u bimaa bada-Allahu bih.',
  translation: 'Sesungguhnya Safa dan Marwah adalah sebahagian daripada syiar-syiar Allah... Kami memulakan dengan apa yang Allah mulakan dengannya (iaitu Safa).',
  sunnahNote: 'Menghadap Kaabah dari Safa, angkat tangan berdoa dan bertakbir 3 kali: "Allahu Akbar, Allahu Akbar, Allahu Akbar, wa lillahil-hamd".'
};

export const GREEN_LIGHT_DUA: DuaItem = {
  id: 'green_lights',
  stage: 'sai',
  title: 'Doa di Kawasan Lampu Hijau (Batn al-Wadi)',
  location: 'Laluan Lampu Hijau Mas\'a',
  arabic: 'رَبِّ اغْفِرْ وَارْحَمْ، وَاعْفُ وَتَكَرَّمْ، وَتَجَاوَزْ عَمَّا تَعْلَمُ، إِنَّكَ تَعْلَمُ مَا لاَ نَعْلَمُ، إِنَّكَ أَنْتَ اللَّهُ الأَعَزُّ الأَكْرَمُ',
  transliteration: 'Rabbighfir warham, wa\'fu wa takarram, wa tajaawaz \'ammaa ta\'lam, innaka ta\'lamu maa laa na\'lam, innaka antallahul-A\'azzul-Akram.',
  translation: 'Wahai Tuhanku ampunilah, kasihanilah, maafkanlah, muliakanlah, dan hapuskanlah apa-apa yang Engkau ketahui dari kesalahanku. Sesungguhnya Engkaulah Allah yang Maha Gagah lagi Maha Pemurah.',
  sunnahNote: 'Sunnah bagi kaum lelaki berlari-lari anak (Harwalah / Raml) di antara kedua tiang/garisan lampu hijau.'
};

export const SAI_DUAS: Record<number, DuaItem> = {
  1: {
    id: 'sai_1',
    stage: 'sai',
    lap: 1,
    title: 'Sa\'i Pusingan 1: Safa ➔ Marwah',
    location: 'Laluan Sa\'i (Pusingan 1)',
    arabic: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'Allahu Akbar, Allahu Akbar, Allahu Akbar, wa lillahil-hamd. Laa ilaaha illallahu wahdahu laa syariika lah, lahul-mulku wa lahul-hamdu wa Huwa \'ala kulli syai-in qadiir.',
    translation: 'Allah Maha Besar, Allah Maha Besar, Allah Maha Besar, dan bagi Allah segala pujian. Tiada tuhan melainkan Allah Yang Maha Esa, tiada sekutu bagi-Nya...',
    sunnahNote: 'Bermula dari Safa menuju ke Marwah dikira sebagai pusingan pertama.'
  },
  2: {
    id: 'sai_2',
    stage: 'sai',
    lap: 2,
    title: 'Sa\'i Pusingan 2: Marwah ➔ Safa',
    location: 'Laluan Sa\'i (Pusingan 2)',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مُوجِبَاتِ رَحْمَتِكَ، وَعَزَائِمَ مَغْفِرَتِكَ، وَالسَّلاَمَةَ مِنْ كُلِّ إِثْمٍ، وَالْغَنِيمَةَ مِنْ كُلِّ بِرٍّ، وَالْفَوْزَ بِالْجَنَّةِ، وَالنَّجَاةَ مِنَ النَّارِ',
    transliteration: 'Allahumma inni as-aluka muujibaati rahmatik, wa \'azaa-ima maghfiratik, was-salaamata min kulli itsm, wal-ghaniimata min kulli birr, wal-fawza bil-jannah, wan-najaata minan-naar.',
    translation: 'Ya Allah, daku memohon sebab-sebab limpahan rahmat-Mu, kepastian keampunan-Mu, terpelihara dari sebarang dosa, perolehan segala kebajikan, kemenangan syurga dan selamat dari neraka.',
    sunnahNote: 'Dari Marwah kembali ke Safa dikira sebagai pusingan kedua.'
  },
  3: {
    id: 'sai_3',
    stage: 'sai',
    lap: 3,
    title: 'Sa\'i Pusingan 3: Safa ➔ Marwah',
    location: 'Laluan Sa\'i (Pusingan 3)',
    arabic: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ، وَتُبْ عَلَيْنَا إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
    transliteration: 'Rabbana taqabbal minnaa innaka Antas-Samii\'ul-\'Aliim, wa tub \'alainaa innaka Antat-Tawwaabur-Rahiim.',
    translation: 'Wahai Tuhan kami, terimalah daripada kami amalan ini. Sesungguhnya Engkau Maha Mendengar lagi Maha Mengetahui, dan terimalah taubat kami sesungguhnya Engkau Maha Penerima Taubat lagi Maha Penyayang.',
    sunnahNote: 'Sentiasa berzikir dan mencontohi kecekalan Sayyidatina Hajar mencari air buat Nabi Ismail a.s.'
  },
  4: {
    id: 'sai_4',
    stage: 'sai',
    lap: 4,
    title: 'Sa\'i Pusingan 4: Marwah ➔ Safa',
    location: 'Laluan Sa\'i (Pusingan 4)',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ، وَتَحَوُّلِ عَافِيَتِكَ، وَفُجَاءَةِ نِقْمَتِكَ، وَجَمِيعِ سَخَطِكَ',
    transliteration: 'Allahumma inni a\'uudzu bika min zawaali ni\'matik, wa tahawwuli \'aafiyatik, wa fujaa-ati niqmatik, wa jamii\'i sakhathik.',
    translation: 'Ya Allah, daku memohon perlindungan-Mu daripada hilangnya nikmat-Mu, berubahnya kesejahteraan kurniaan-Mu, kejutan bencana kemurkaan-Mu, dan segala kemurkaan-Mu.',
    sunnahNote: 'Kekalkan langkah tertib dan berhati-hati dengan jemaah lain.'
  },
  5: {
    id: 'sai_5',
    stage: 'sai',
    lap: 5,
    title: 'Sa\'i Pusingan 5: Safa ➔ Marwah',
    location: 'Laluan Sa\'i (Pusingan 5)',
    arabic: 'اللَّهُمَّ حَبِّبْ إِلَيْنَا الإِيمَانَ وَزَيِّنْهُ فِي قُلُوبِنَا، وَكَرِّهْ إِلَيْنَا الْكُفْرَ وَالْفُسُوقَ وَالْعِصْيَانَ، وَاجْعَلْنَا مِنَ الرَّاشِدِينَ',
    transliteration: 'Allahumma habbib ilainal-iimaana wa zayyinhu fii quluubinaa, wa karrih ilainal-kufra wal-fusuuqa wal-\'ishyaan, waj\'alnaa minar-raasyidiin.',
    translation: 'Ya Allah, tanamkanlah kecintaan kepada keimanan dalam hati kami dan hiaskanlah keimanan itu di sanubari kami, serta bencikanlah kepada kekufuran, kefasikan dan kedurhakaan, dan jadikanlah kami orang yang mendapat petunjuk.',
    sunnahNote: 'Teruskan bersemangat melengkapkan pusingan ke-5.'
  },
  6: {
    id: 'sai_6',
    stage: 'sai',
    lap: 6,
    title: 'Sa\'i Pusingan 6: Marwah ➔ Safa',
    location: 'Laluan Sa\'i (Pusingan 6)',
    arabic: 'اللَّهُمَّ فَقِّهْنَا فِي الدِّينِ وَعَلِّمْنَا التَّأْوِيلَ، وَاجْعَلْنَا هُدَاةً مُهْتَدِينَ، غَيْرَ ضَالِّينَ وَلاَ مُضِلِّينَ',
    transliteration: 'Allahumma faqqihnaa fid-diini wa \'allimnat-ta\'wiil, waj\'alnaa hudaatan muhtadiin, ghaira dhaalliina wa laa mudhilliin.',
    translation: 'Ya Allah, berikanlah kami kefahaman yang mendalam dalam agama dan ajarkanlah kami ilmu hikmah, dan jadikanlah kami penunjuk jalan kebaikan yang mendapat petunjuk.',
    sunnahNote: 'Pusingan ke-6 menuju Safa. Pusingan seterusnya akan tamat di Marwah.'
  },
  7: {
    id: 'sai_7',
    stage: 'sai',
    lap: 7,
    title: 'Sa\'i Pusingan 7: Safa ➔ Marwah (Terakhir)',
    location: 'Laluan Sa\'i (Pusingan 7 - Marwah)',
    arabic: 'رَبَّنَا تَقَبَّلْ مِنَّا وَعَافِنَا وَاعْفُ عَنَّا، وَعَلَى طَاعَتِكَ وَشُكْرِكَ أَعِنَّا، وَعَلَى غَيْرِكَ لاَ تَكِلْنَا، وَاخْتِمْ بِالصَّالِحَاتِ أَعْمَالَنَا',
    transliteration: 'Rabbana taqabbal minnaa wa \'aafinaa wa\'fu \'annaa, wa \'alaa thaa\'atika wa syukrika a\'innaa, wa \'alaa ghairika laa takilnaa, wakhtim bish-shaalihaati a\'maalanaa.',
    translation: 'Wahai Tuhan kami, terimalah daripada kami, selamatkanlah kami, maafkanlah kami, bantulah kami untuk sentiasa taat dan bersyukur kepada-Mu, dan sudahilah kehidupan kami dengan amal soleh.',
    sunnahNote: 'Sa\'i lengkap 7 pusingan dan berakhir di Bukit Marwah. Bersedia untuk Tahallul (bercukur / bergunting).'
  }
};

export const TAHALLUL_DUA: DuaItem = {
  id: 'tahallul',
  stage: 'tahallul',
  title: 'Doa Bercukur / Bergunting (Tahallul)',
  location: 'Kawasan Marwah / Tahallul',
  arabic: 'الْحَمْدُ لِلَّهِ عَلَى مَا هَدَانَا، وَالْحَمْدُ لِلَّهِ عَلَى مَا أَنْعَمَ بِهِ عَلَيْنَا، اللَّهُمَّ هَذِهِ نَاصِيَتِي فَتَقَبَّلْ مِنِّي وَاغْفِرْ لِي ذُنُوبِي',
  transliteration: 'Alhamdulillahil-ladzii hadaanaa, walhamdulillahil-ladzii an\'ama bihi \'alainaa. Allahumma haadzihi naashiyatii fataqabbal minnii waghfir lii dzunuubii.',
  translation: 'Segala puji bagi Allah yang telah memimpin kami, dan segala puji bagi Allah atas segala nikmat yang dikurniakan-Nya. Ya Allah, ini ubun-ubunku maka terimalah daripadaku dan ampunilah segala dosaku.',
  sunnahNote: 'Lelaki afdhal bercukur licin (Halq) atau memendekkan rambut (Taqsir). Wanita mengumpulkan hujung rambut dan menggunting sekadar seruas jari (kira-kira 2cm).'
};
