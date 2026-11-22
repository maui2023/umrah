import { AyatLazimItem } from '../types';

export interface SaiLapInfo {
  lap: number;
  from: 'safa' | 'marwah';
  to: 'marwah' | 'safa';
  fromLabel: string;
  toLabel: string;
  title: string;
  theme: string;
  arabic: string;
  transliteration: string;
  translation: string;
  sunnahNote: string;
}

export const SAI_LAPS: Record<number, SaiLapInfo> = {
  1: {
    lap: 1,
    from: 'safa',
    to: 'marwah',
    fromLabel: 'Bukit Safa',
    toLabel: 'Bukit Marwah',
    title: 'Sa\'i Pusingan 1: Safa ➔ Marwah',
    theme: 'Tauhid, Takbir & Pengagungan Allah',
    arabic: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الأَحْزَابَ وَحْدَهُ',
    transliteration: 'Allahu Akbar, Allahu Akbar, Allahu Akbar, wa lillahil-hamd. Laa ilaaha illallahu wahdahu laa syariika lah, lahul-mulku wa lahul-hamdu wa Huwa \'ala kulli syai-in qadiir. Laa ilaaha illallahu wahdah, anjaza wa\'dah, wa nashara \'abdah, wa hazamal-ahzaaba wahdah.',
    translation: 'Allah Maha Besar, Allah Maha Besar, Allah Maha Besar, dan bagi Allah segala puji. Tiada tuhan melainkan Allah Yang Maha Esa, tiada sekutu bagi-Nya, bagi-Nya kerajaan dan bagi-Nya segala pujian, dan Dia Maha Kuasa atas setiap sesuatu. Tiada tuhan melainkan Allah Yang Maha Esa, yang menepati janji-Nya, menolong hamba-Nya dan menewaskan tentera bersekutu dengan keesaan-Nya.',
    sunnahNote: 'Bermula di puncak Bukit Safa menghadap Kaabah. Baca ayat "Innas-Safa wal-Marwata min sya\'airillah". Pusingan pertama selesai apabila tiba di Bukit Marwah.'
  },
  2: {
    lap: 2,
    from: 'marwah',
    to: 'safa',
    fromLabel: 'Bukit Marwah',
    toLabel: 'Bukit Safa',
    title: 'Sa\'i Pusingan 2: Marwah ➔ Safa',
    theme: 'Permohonan Rahmat, Keampunan & Keselamatan',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مُوجِبَاتِ رَحْمَتِكَ، وَعَزَائِمَ مَغْفِرَتِكَ، وَالسَّلاَمَةَ مِنْ كُلِّ إِثْمٍ، وَالْغَنِيمَةَ مِنْ كُلِّ بِرٍّ، وَالْفَوْزَ بِالْجَنَّةِ، وَالنَّجَاةَ مِنَ النَّارِ',
    transliteration: 'Allahumma inni as-aluka muujibaati rahmatik, wa \'azaa-ima maghfiratik, was-salaamata min kulli itsm, wal-ghaniimata min kulli birr, wal-fawza bil-jannah, wan-najaata minan-naar.',
    translation: 'Ya Allah, daku memohon kepada-Mu sebab-sebab limpahan rahmat-Mu, kepastian keampunan-Mu, terpelihara dari sebarang dosa, perolehan segala kebajikan, kemenangan syurga dan selamat daripada api neraka.',
    sunnahNote: 'Berjalan dari Bukit Marwah kembali menuju ke Bukit Safa dikira sebagai pusingan kedua. Sentiasa mengingati keagungan Allah.'
  },
  3: {
    lap: 3,
    from: 'safa',
    to: 'marwah',
    fromLabel: 'Bukit Safa',
    toLabel: 'Bukit Marwah',
    title: 'Sa\'i Pusingan 3: Safa ➔ Marwah',
    theme: 'Penerimaan Amal Ibadah & Taubat',
    arabic: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ، وَتُبْ عَلَيْنَا إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ، وَنَجِّنَا مِنَ الْقَوْمِ الظَّالِمِينَ',
    transliteration: 'Rabbana taqabbal minnaa innaka Antas-Samii\'ul-\'Aliim, wa tub \'alainaa innaka Antat-Tawwaabur-Rahiim, wa najjinaa minal-qawmizh-zhaalimiin.',
    translation: 'Wahai Tuhan kami, terimalah daripada kami amalan ini. Sesungguhnya Engkaulah Yang Maha Mendengar lagi Maha Mengetahui, dan terimalah taubat kami sesungguhnya Engkaulah Maha Penerima Taubat lagi Maha Penyayang, dan selamatkanlah kami dari kaum yang zalim.',
    sunnahNote: 'Mencontohi kecekalan Sayyidatina Hajar mencari air. Di zon tiang lampu hijau, disunatkan bagi lelaki berlari-lari anak (Harwalah).'
  },
  4: {
    lap: 4,
    from: 'marwah',
    to: 'safa',
    fromLabel: 'Bukit Marwah',
    toLabel: 'Bukit Safa',
    title: 'Sa\'i Pusingan 4: Marwah ➔ Safa',
    theme: 'Perlindungan Dari Kehilangan Nikmat & Bala',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ، وَتَحَوُّلِ عَافِيَتِكَ، وَفُجَاءَةِ نِقْمَتِكَ، وَجَمِيعِ سَخَطِكَ، يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ',
    transliteration: 'Allahumma inni a\'uudzu bika min zawaali ni\'matik, wa tahawwuli \'aafiyatik, wa fujaa-ati niqmatik, wa jamii\'i sakhathik, yaa Hayyu yaa Qayyuumu birahmatika astaghiits.',
    translation: 'Ya Allah, daku memohon perlindungan-Mu daripada lenyapnya nikmat-Mu, berubahnya kesejahteraan kurniaan-Mu, tibanya kemurkaan-Mu secara tiba-tiba, dan segala kemurkaan-Mu. Wahai Yang Maha Hidup lagi Maha Berdiri Sendiri, dengan rahmat-Mu daku memohon pertolongan.',
    sunnahNote: 'Pusingan ke-4 melepasi separuh daripada perjalanan Sa\'i. Teruskan berzikir dan mendoakan keselamatan ibu bapa dan keluarga.'
  },
  5: {
    lap: 5,
    from: 'safa',
    to: 'marwah',
    fromLabel: 'Bukit Safa',
    toLabel: 'Bukit Marwah',
    title: 'Sa\'i Pusingan 5: Safa ➔ Marwah',
    theme: 'Kecintaan Terhadap Keimanan & Petunjuk',
    arabic: 'اللَّهُمَّ حَبِّبْ إِلَيْنَا الإِيمَانَ وَزَيِّنْهُ فِي قُلُوبِنَا، وَكَرِّهْ إِلَيْنَا الْكُفْرَ وَالْفُسُوقَ وَالْعِصْيَانَ، وَاجْعَلْنَا مِنَ الرَّاشِدِينَ',
    transliteration: 'Allahumma habbib ilainal-iimaana wa zayyinhu fii quluubinaa, wa karrih ilainal-kufra wal-fusuuqa wal-\'ishyaan, waj\'alnaa minar-raasyidiin.',
    translation: 'Ya Allah, tanamkanlah kecintaan terhadap keimanan ke dalam hati kami dan hiaskanlah keimanan itu di sanubari kami, serta tanamkanlah kebencian terhadap kekufuran, kefasikan dan kederhakaan, dan jadikanlah kami daripada golongan yang mendapat petunjuk.',
    sunnahNote: 'Melangkah dengan tenang dan menjaga pandangan. Disunatkan membaca doa dan selawat sepanjang perjalanan.'
  },
  6: {
    lap: 6,
    from: 'marwah',
    to: 'safa',
    fromLabel: 'Bukit Marwah',
    toLabel: 'Bukit Safa',
    title: 'Sa\'i Pusingan 6: Marwah ➔ Safa',
    theme: 'Kefahaman Agama, Hikmah & Istiqamah',
    arabic: 'اللَّهُمَّ فَقِّهْنَا فِي الدِّينِ وَعَلِّمْنَا التَّأْوِيلَ، وَاجْعَلْنَا هُدَاةً مُهْتَدِينَ، غَيْرَ ضَالِّينَ وَلاَ مُضِلِّينَ، سِلْمًا لأَوْلِيَائِكَ وَحَرْبًا عَلَى أَعْدَائِكَ',
    transliteration: 'Allahumma faqqihnaa fid-diini wa \'allimnat-ta\'wiil, waj\'alnaa hudaatan muhtadiin, ghaira dhaalliina wa laa mudhilliin, silman li-awliyaa-ika wa harban \'alaa a\'daa-ik.',
    translation: 'Ya Allah, berikanlah kefahaman yang mendalam kepada kami dalam urusan agama dan ajarkanlah kami ilmu takwil (hikmah), dan jadikanlah kami pembimbing yang mendapat petunjuk, bukan yang sesat mahupun menyesatkan.',
    sunnahNote: 'Pusingan terakhir menghala ke Bukit Safa. Pusingan ke-7 seterusnya akan tamat di Bukit Marwah.'
  },
  7: {
    lap: 7,
    from: 'safa',
    to: 'marwah',
    fromLabel: 'Bukit Safa',
    toLabel: 'Bukit Marwah',
    title: 'Sa\'i Pusingan 7: Safa ➔ Marwah (Terakhir)',
    theme: 'Penerimaan Ibadah Umrah, Syukur & Husnul Khatimah',
    arabic: 'رَبَّنَا تَقَبَّلْ مِنَّا وَعَافِنَا وَاعْفُ عَنَّا، وَعَلَى طَاعَتِكَ وَشُكْرِكَ أَعِنَّا، وَعَلَى غَيْرِكَ لاَ تَكِلْنَا، وَاخْتِمْ بِالصَّالِحَاتِ أَعْمَالَنَا، وَصَلَّى اللَّهُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ',
    transliteration: 'Rabbana taqabbal minnaa wa \'aafinaa wa\'fu \'annaa, wa \'alaa thaa\'atika wa syukrika a\'innaa, wa \'alaa ghairika laa takilnaa, wakhtim bish-shaalihaati a\'maalanaa, wa shallallaahu \'ala Sayyidina Muhammadin wa \'ala aalihi wa shahbihi wa sallam.',
    translation: 'Wahai Tuhan kami, terimalah daripada kami, sejahterakanlah kami, maafkanlah kami, bantulah kami untuk sentiasa taat dan bersyukur kepada-Mu, janganlah Engkau serahkan urusan kami kepada selain-Mu, dan sudahilah kehidupan kami dengan amal-amal soleh. Selawat dan salam ke atas junjungan Nabi Muhammad ﷺ, ahli keluarga dan para sahabat baginda.',
    sunnahNote: 'Alhamdulillah! Sa\'i lengkap 7 pusingan dan berakhir di Bukit Marwah. Jemaah kini bersedia untuk Tahallul (bercukur licin / bergunting).'
  }
};

export const GREEN_LIGHT_INFO = {
  title: 'Zon Garisan Lampu Hijau (Batn al-Wadi)',
  location: 'Laluan Mas\'a antara Bukit Safa dan Bukit Marwah',
  hukum: 'Sunnah bagi jemaah LELAKI berlari-lari anak (Harwalah / Raml). Jemaah WANITA berjalan seperti biasa.',
  sejarah: 'Batn al-Wadi merupakan kawasan lembah rendah yang dahulunya agak curam. Di sinilah Sayyidatina Hajar mempercepatkan lariannya kerana terhalang pandangan daripada melihat puteranya Nabi Ismail a.s. yang ditinggalkan di kawasan Kaabah.',
  arabic: 'رَبِّ اغْفِرْ وَارْحَمْ، وَاعْفُ وَتَكَرَّمْ، وَتَجَاوَزْ عَمَّا تَعْلَمُ، إِنَّكَ تَعْلَمُ مَا لاَ نَعْلَمُ، إِنَّكَ أَنْتَ اللَّهُ الأَعَزُّ الأَكْرَمُ',
  transliteration: 'Rabbighfir warham, wa\'fu wa takarram, wa tajaawaz \'ammaa ta\'lam, innaka ta\'lamu maa laa na\'lam, innaka antallahul-A\'azzul-Akram.',
  translation: 'Wahai Tuhanku ampunilah, kasihanilah, maafkanlah, muliakanlah, dan hapuskanlah dosa-dosa yang Engkau ketahui. Sesungguhnya Engkau mengetahui apa yang kami tidak ketahui, dan sesungguhnya Engkaulah Allah Yang Maha Mulia lagi Maha Pemurah.'
};

export const AYAT_LAZIM_SAI: AyatLazimItem[] = [
  {
    id: 'ayat_safa_mula',
    category: 'ayat',
    title: 'Ayat Permulaan Sa\'i di Safa & Marwah',
    surahOrSource: 'Surah Al-Baqarah: 158',
    arabic: '۞ إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ ۖ فَمَنْ حَجَّ الْبَيْتَ أَوِ اعْتَمَرَ فَلَا جُنَاحَ عَلَيْهِ أَن يَطَّوَّفَ بِهِمَا ۚ وَمَن تَطَوَّعَ خَيْرًا فَإِنَّ اللَّهَ شَاكِرٌ عَلِيمٌ',
    transliteration: 'Innash-shafaa wal-marwata min sya\'aa-irillah. Faman hajjal-baita awi\'tamara falaa junaaha \'alaihi ay-yaththawwafa bihimaa, wa man tathawwa\'a khairan fa-innallaha Syaakirun \'Aliim.',
    translation: 'Sesungguhnya Safa dan Marwah itu adalah sebahagian daripada syiar-syiar agama Allah. Maka sesiapa yang menunaikan ibadah Haji ke Baitullah atau mengerjakan Umrah, tidak ada salahnya ia bersa\'i (berulang-alik) di antara keduanya; dan sesiapa yang sukarela mengerjakan kebaikan, maka sesungguhnya Allah Maha Menilai lagi Maha Mengetahui.',
    fadhilat: 'Sunnah dibaca ketika mula-mula mendaki Bukit Safa sebelum memulakan pusingan pertama sambil mengucap "Nabda\'u bimaa bada-Allahu bih" (Kami memulakan dengan apa yang dimulakan oleh Allah).'
  },
  {
    id: 'ayat_kursi',
    category: 'ayat',
    title: 'Ayat Al-Kursi (Penghulu Segala Ayat Al-Quran)',
    surahOrSource: 'Surah Al-Baqarah: 255',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliteration: 'Allahu laa ilaaha illaa Huwal-Hayyul-Qayyuum, laa ta\'khudzuhu sinatuw-walaa nawm, lahu maa fis-samaawaati wa maa fil-ardh, man dzal-ladzii yasyfa\'u \'indahuu illaa bi-idznih, ya\'lamu maa baina aidiihim wa maa khalfahum, wa laa yuhiithuuna bisyai-im-min \'ilmihii illaa bimaa syaa\', wasi\'a kursiyyuhus-samaawaati wal-ardh, wa laa ya-uuduhuu hifzhuhumaa, wa Huwal-\'Aliyyul-\'Azhiim.',
    translation: 'Allah, tiada Tuhan melainkan Dia, Yang Maha Hidup lagi sentiasa mentadbir sekalian makhluk-Nya. Tidak mengantuk dan tidak tidur. Milik-Nya segala yang ada di langit dan di bumi. Tiada sesiapa dapat memberi syafaat di sisi-Nya melainkan dengan izin-Nya. Dia mengetahui apa yang di hadapan dan di belakang mereka, dan mereka tidak mengetahui sesuatu pun daripada ilmu-Nya melainkan apa yang dikehendaki-Nya. Luasnya Kursi Allah meliputi langit dan bumi; dan tiadalah menjadi keberatan bagi-Nya menjaga keduanya. Dan Dialah Yang Maha Tinggi lagi Maha Agung.',
    fadhilat: 'Ayat paling agung dalam Al-Quran. Membaca Ayat Kursi semasa Sa\'i mendatangkan perlindungan malaikat, ketenangan jiwa dan menghalau gangguan syaitan.'
  },
  {
    id: 'ayat_seribu_dinar',
    category: 'ayat',
    title: 'Ayat Seribu Dinar (Keluasan Rezeki & Tawakal)',
    surahOrSource: 'Surah At-Talaq: 2 - 3',
    arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ۝ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ ۚ قَدْ جَعَلَ اللَّهُ لِكُلِّ شَيْءٍ قَدْرًا',
    transliteration: 'Wa man yattaqillaha yaj\'al lahuu makhrajaa, wa yarzuq-hu min haitsu laa yahtasib, wa man yatawakkal \'alallahi fahuwa hasbuh, innallaha baalighu amrih, qad ja\'alallahu likulli syai-in qadraa.',
    translation: 'Dan sesiapa yang bertakwa kepada Allah, nescaya Allah akan mengadakan baginya jalan keluar (dari segala kesulitan). Dan memberinya rezeki dari arah yang tidak disangka-sangkanya. Dan sesiapa yang bertawakal kepada Allah, nescaya Allah mencukupkan (keperluannya). Sesungguhnya Allah tetap melaksanakan urusan-Nya. Sesungguhnya Allah telah menentukan kadar bagi tiap-tiap sesuatu.',
    fadhilat: 'Sangat mustajab diamalkan ketika bersa\'i bagi memohon jalan keluar dari segala kebuntuan hidup, kelapangan rezeki dan kebergantungan mutlak kepada Allah.'
  },
  {
    id: 'doa_nabi_yunus',
    category: 'ayat',
    title: 'Doa Nabi Yunus a.s. (Penghapus Kesusahan & Kesedihan)',
    surahOrSource: 'Surah Al-Anbiya: 87',
    arabic: 'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
    transliteration: 'Laa ilaaha illaa Anta subhaanaka innii kuntu minazh-zhaalimiin.',
    translation: 'Tiada Tuhan melainkan Engkau (ya Allah)! Maha Suci Engkau, sesungguhnya daku adalah daripada orang-orang yang zalim.',
    fadhilat: 'Rasulullah ﷺ bersabda: Tiada seorang muslim yang berdoa dengannya dalam apa jua masalah melainkan Allah memperkenankan doanya.'
  },
  {
    id: 'doa_sapu_jagad',
    category: 'ayat',
    title: 'Doa Sapu Jagad (Kebaikan Dunia & Akhirat)',
    surahOrSource: 'Surah Al-Baqarah: 201',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: 'Rabbana aatina fid-dunya hasanah, wa fil-aakhirati hasanah, wa qinaa \'adzaaban-naar.',
    translation: 'Wahai Tuhan kami, berikanlah kepada kami kebaikan di dunia dan kebaikan di akhirat, dan peliharalah kami daripada azab api neraka.',
    fadhilat: 'Doa yang paling kerap dibaca oleh baginda Rasulullah ﷺ dalam ibadah Tawaf dan Sa\'i.'
  },
  {
    id: 'doa_ketetapan_iman',
    category: 'ayat',
    title: 'Doa Ketetapan Iman & Hati',
    surahOrSource: 'Surah Ali \'Imran: 8',
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ',
    transliteration: 'Rabbanaa laa tuzigh quluubanaa ba\'da idz hadaitanaa wa hab lanaa mil-ladunka rahmah, innaka Antal-Wahhaab.',
    translation: 'Wahai Tuhan kami! Janganlah Engkau pesongkan hati kami sesudah Engkau beri petunjuk kepada kami, dan kurniakanlah kepada kami limpah rahmat dari sisi-Mu; sesungguhnya Engkaulah Maha Pemberi.',
    fadhilat: 'Memelihara iman agar teguh tidak tergoncang sehingga akhir hayat.'
  },
  {
    id: 'doa_keluarga_bahagia',
    category: 'ayat',
    title: 'Doa Pasangan & Zuriat Penyejuk Mata',
    surahOrSource: 'Surah Al-Furqan: 74',
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    transliteration: 'Rabbanaa hab lanaa min azwaajinaa wa dzurriyyatinaa qurrata a\'yuniw-waj\'alnaa lil-muttaqiina imaamaa.',
    translation: 'Wahai Tuhan kami, kurniakanlah kepada kami daripada pasangan kami dan zuriat keturunan kami perkara-perkara yang menjadi penyejuk mata (hati), dan jadikanlah kami ikutan bagi orang-orang yang bertakwa.',
    fadhilat: 'Doa mustajab bagi keharmonian rumah tangga, kebahagiaan zuriat dan kepimpinan soleh.'
  },
  {
    id: 'doa_keampunan_ibu_bapa',
    category: 'ayat',
    title: 'Doa Pengampunan Diri, Ibu Bapa & Seluruh Mukmin',
    surahOrSource: 'Surah Ibrahim: 41',
    arabic: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
    transliteration: 'Rabbanagh-fir lii wa liwaalidayya wa lil-mu\'miniina yawma yaquumul-hisaab.',
    translation: 'Wahai Tuhan kami! Berikanlah keampunan kepadaku dan kepada kedua ibu bapaku serta sekalian orang mukmin pada hari berlakunya hisab (perhitungan amal).',
    fadhilat: 'Penzahiran bakti anak kepada kedua ibu bapa di Tanah Suci yang mustajab doanya.'
  }
];

export const SURAH_LAZIM_SAI: AyatLazimItem[] = [
  {
    id: 'surah_fatihah',
    category: 'surah',
    title: 'Surah Al-Fatihah (Pembuka & Penyembuh Segala Penyakit)',
    surahOrSource: 'Surah 1: 1 - 7',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    transliteration: 'Bismillahir-Rahmaanir-Rahiim. Al-hamdu lillahi Rabbil-\'aalamiin. Ar-Rahmaanir-Rahiim. Maaliki yawmid-diin. Iyyaaka na\'budu wa iyyaaka nasta\'iin. Ihdinash-shiraathal-mustaqiim. Shiraathal-ladziina an\'amta \'alaihim, ghairil-maghdhuubi \'alaihim wa ladh-dhaalliin. Aamiin.',
    translation: 'Dengan nama Allah Yang Maha Pemurah lagi Maha Mengasihani. Segala puji bagi Allah, Tuhan sekalian alam. Yang Maha Pemurah lagi Maha Mengasihani. Yang Menguasai Hari Pembalasan. Hanya kepada-Mu kami menyembah dan hanya kepada-Mu kami memohon pertolongan. Tunjukilah kami jalan yang lurus; iaitu jalan orang-orang yang telah Engkau kurniakan nikmat kepada mereka, bukan jalan orang-orang yang dimurkai dan bukan pula jalan orang-orang yang sesat.',
    fadhilat: 'Ummul Kitab (Ibu Al-Quran) dan Asy-Syifa (Penyembuh). Membaca Al-Fatihah semasa Sa\'i membuka segala pintu kebaikan.'
  },
  {
    id: 'surah_ikhlas',
    category: 'surah',
    title: 'Surah Al-Ikhlas (Menyamai 1/3 Al-Quran)',
    surahOrSource: 'Surah 112: 1 - 4',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    transliteration: 'Qul Huwallahu Ahad. Allahush-Shamad. Lam yalid wa lam yuulad. Wa lam yakul-lahu kufuwan ahad.',
    translation: 'Katakanlah (wahai Muhammad): Dialah Allah Yang Maha Esa. Allah tempat bergantung sekalian makhluk. Dia tidak beranak dan tidak diperanakkan. Dan tiada sesiapa pun yang setara dengan-Nya.',
    fadhilat: 'Ganjaran membacanya menyamai sepertiga Al-Quran dan meneguhkan ketulenan akidah tauhid.'
  },
  {
    id: 'surah_falaq',
    category: 'surah',
    title: 'Surah Al-Falaq (Perlindungan Dari Hasad & Kejahatan)',
    surahOrSource: 'Surah 113: 1 - 5',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    transliteration: 'Qul a\'uudzu bi Rabbil-falaq. Min syarri maa khalaq. Wa min syarri ghaasiqin idzaa waqab. Wa min syarrin-naffaatsaati fil-\'uqad. Wa min syarri haasidin idzaa hasad.',
    translation: 'Katakanlah: Daku berlindung kepada Tuhan yang menciptakan waktu subuh. Dari kejahatan apa-apa yang diciptakan-Nya. Dan dari kejahatan malam apabila telah gelap gelita. Dan dari kejahatan tukang-tukang sihir yang menghembus pada simpulan-simpulan. Dan dari kejahatan orang yang dengki apabila ia mendengki.',
    fadhilat: 'Salah satu daripada Mu\'awwidzatain (benteng perlindungan) dari penyakit ain, sihir dan hasad dengki manusia.'
  },
  {
    id: 'surah_nas',
    category: 'surah',
    title: 'Surah An-Nas (Perlindungan Dari Bisikan Was-Was)',
    surahOrSource: 'Surah 114: 1 - 6',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    transliteration: 'Qul a\'uudzu bi Rabbin-naas. Malikin-naas. Ilaahin-naas. Min syarril-waswaasil-khannaas. Alladzii yuwaswisu fii shuduurin-naas. Minal-jinnati wan-naas.',
    translation: 'Katakanlah: Daku berlindung kepada Tuhan sekalian manusia. Raja sekalian manusia. Sesembahan sekalian manusia. Dari kejahatan pembisik was-was yang bersembunyi. Yang membisikkan kejahatan ke dalam dada manusia. Dari kalangan jin dan manusia.',
    fadhilat: 'Menghapuskan rasa was-was kiraan pusingan dan membersihkan hati dari lintasan syaitan semasa beribadah.'
  },
  {
    id: 'surah_kafirun',
    category: 'surah',
    title: 'Surah Al-Kafirun (Pelepasan Diri Daripada Syirik)',
    surahOrSource: 'Surah 109: 1 - 6',
    arabic: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ ۝ لَا أَعْبُدُ مَا تَعْبُدُونَ ۝ وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ ۝ وَلَا أَنَا عَابِدٌ مَّا عَبَدتُّمْ ۝ وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ ۝ لَكُمْ دِينُكُمْ وَلِيَ دِينِ',
    transliteration: 'Qul yaa ayyuhal-kaafiruun. Laa a\'budu maa ta\'buduun. Wa laa antum \'aabiduuna maa a\'bud. Wa laa ana \'aabidum-maa \'abattum. Wa laa antum \'aabiduuna maa a\'bud. Lakum diinukum wa liya diin.',
    translation: 'Katakanlah: Wahai orang-orang kafir! Aku tidak akan menyembah apa yang kamu sembah. Dan kamu tidak mahu menyembah apa yang aku sembah. Dan aku tidak akan beribadah mengikut cara ibadah kamu. Dan kamu pula tidak mahu menyembah apa yang aku sembah. Bagi kamu agama kamu, dan bagiku agamaku.',
    fadhilat: 'Ganjaran menyamai seperempat Al-Quran dan membebaskan diri daripada sebarang syirik kepada Allah.'
  },
  {
    id: 'surah_insyirah',
    category: 'surah',
    title: 'Surah Al-Insyirah (Kelapangan Hati & Kemudahan Urusan)',
    surahOrSource: 'Surah 94: 1 - 8',
    arabic: 'أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ ۝ وَوَضَعْنَا عَنكَ وِزْرَكَ ۝ الَّذِي أَنقَضَ ظَهْرَكَ ۝ وَرَفَعْنَا لَكَ ذِكْرَكَ ۝ فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ فَإِذَا فَرَغْتَ فَانصَبْ ۝ وَإِلَىٰ رَبِّكَ فَارْغَب',
    transliteration: 'Alam nasyrah laka shadrak. Wa wadha\'naa \'anka wizrak. Alladzii anqadha zhahrak. Wa rafa\'naa laka dzikrak. Fa-inna ma\'al-\'usri yusraa. Inna ma\'al-\'usri yusraa. Fa-idzaa faraghta fanshab. Wa ilaa Rabbika farghab.',
    translation: 'Bukankah Kami telah melapangkan dadamu (wahai Muhammad)? Dan Kami telah meringankan bebanmu yang memberatkan belakangmu? Serta Kami tinggikan sebutan namamu? Kerana sesungguhnya bersama kesusahan ada kemudahan. Sesungguhnya bersama kesusahan ada kemudahan. Maka apabila engkau telah selesai (dari sesuatu urusan), berusahalah bersungguh-sungguh (untuk urusan yang lain), dan hanya kepada Tuhanmulah engkau berharap.',
    fadhilat: 'Memberikan kekuatan jasmani dan rohani, menghilangkan keletihan fizikal ketika melangkah berulang-alik di Mas\'a.'
  },
  {
    id: 'surah_qadr',
    category: 'surah',
    title: 'Surah Al-Qadr (Kemuliaan Malam Lailatul Qadr)',
    surahOrSource: 'Surah 97: 1 - 5',
    arabic: 'إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ ۝ وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ ۝ لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ ۝ تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ ۝ سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ',
    transliteration: 'Innaa anzalnaahu fii lailatil-qadr. Wa maa adraaka maa lailatul-qadr. Lailatul-qadri khairum-min alfi syahr. Tanazzalul-malaa-ikatu war-ruuhu fiihaa bi-idzni Rabbihim min kulli amr. Salaamun hiya hattaa mathla\'il-fajr.',
    translation: 'Sesungguhnya Kami telah menurunkannya (Al-Quran) pada Malam Lailatul Qadar. Dan tahukah engkau apakah Malam Lailatul Qadar itu? Malam Lailatul Qadar itu lebih baik daripada seribu bulan. Pada malam itu turun para malaikat dan Jibril dengan izin Tuhan mereka membawa segala urusan. Sejahteralah malam itu sehingga terbit fajar.',
    fadhilat: 'Mengingatkan jemaah akan keagungan malam kemuliaan di Tanah Suci yang dipenuhi keberkatan.'
  }
];

export const ZIKIR_LAZIM_SAI: AyatLazimItem[] = [
  {
    id: 'zikir_safa_marwah',
    category: 'zikir',
    title: 'Zikir & Takbir di Atas Puncak Safa dan Marwah',
    surahOrSource: 'Hadis Sahih Muslim',
    arabic: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ. لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الأَحْزَابَ وَحْدَهُ',
    transliteration: 'Allahu Akbar, Allahu Akbar, Allahu Akbar, wa lillahil-hamd. Laa ilaaha illallahu wahdahu laa syariika lah, lahul-mulku wa lahul-hamdu, yuhyii wa yumiitu wa Huwa \'ala kulli syai-in qadiir. Laa ilaaha illallahu wahdah, anjaza wa\'dah, wa nashara \'abdah, wa hazamal-ahzaaba wahdah.',
    translation: 'Allah Maha Besar, Allah Maha Besar, Allah Maha Besar, dan bagi Allah segala puji. Tiada tuhan melainkan Allah Yang Maha Esa, tiada sekutu bagi-Nya, milik-Nya segala kerajaan dan pujian, Dia yang menghidupkan dan mematikan, dan Dia Maha Kuasa atas segala sesuatu. Tiada tuhan melainkan Allah Yang Maha Esa, yang menepati janji-Nya, menolong hamba-Nya dan mengalahkan tentera bersekutu dengan keesaan-Nya.',
    fadhilat: 'Sunnah dibaca 3 kali di puncak Bukit Safa dan Marwah sambil menghadap Kaabah dengan kedua-dua belah tangan diangkat berdoa.'
  },
  {
    id: 'zikir_tasbih_4',
    category: 'zikir',
    title: 'Kalimah Thayyibah & Hauqalah (Tanaman Syurga)',
    surahOrSource: 'Kalimah Ma\'tsur',
    arabic: 'سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
    transliteration: 'Subhaanallahi wal-hamdulillahi wa laa ilaaha illallahu wallaahu Akbar, wa laa hawla wa laa quwwata illaa billaahil-\'Aliyyil-\'Azhiim.',
    translation: 'Maha Suci Allah, segala puji bagi Allah, tiada tuhan melainkan Allah, Allah Maha Besar, dan tiada daya serta upaya melainkan dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung.',
    fadhilat: 'Ucapan yang paling disukai oleh Allah SWT. Menggugurkan dosa sebagaimana daun-daun berguguran dari pohon.'
  },
  {
    id: 'sayyidul_istighfar',
    category: 'zikir',
    title: 'Sayyidul Istighfar (Penghulu Segala Istighfar)',
    surahOrSource: 'Hadis Riwayat Bukhari',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ',
    transliteration: 'Allahumma Anta Rabbii laa ilaaha illaa Anta, khalaqtanii wa anaa \'abduka, wa anaa \'alaa \'ahdika wa wa\'dika mastatha\'tu, a\'uudzu bika min syarri maa shana\'tu, abuu-u laka bini\'matika \'alayya, wa abuu-u bidzambii faghfir lii fa-innahuu laa yaghfirudz-dzunuuba illaa Anta.',
    translation: 'Ya Allah, Engkaulah Tuhanku, tiada Tuhan selain Engkau. Engkaulah yang menciptakanku dan aku adalah hamba-Mu. Aku akan setia pada janji-Mu semampuku. Aku berlindung kepada-Mu dari keburukan yang telah aku lakukan. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku kepada-Mu, maka ampunilah aku, sesungguhnya tiada yang mengampuni dosa-dosa selain Engkau.',
    fadhilat: 'Barangsiapa membacanya dengan penuh keyakinan pada waktu siang lalu meninggal dunia sebelum petang, ia termasuk ahli syurga.'
  },
  {
    id: 'selawat_ibrahimiyyah',
    category: 'zikir',
    title: 'Selawat Ibrahimiyyah ke atas Nabi Muhammad ﷺ',
    surahOrSource: 'Selawat Paling Afdhal',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى سَيِّدِنَا إِبْرَاهِيمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيمَ، وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى سَيِّدِنَا إِبْرَاهِيمَ وَعَلَى آلِ سَيِّدِنَا إِبْرَاهِيمَ، فِي الْعَالَمِينَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    transliteration: 'Allahumma shalli \'ala Sayyidina Muhammad wa \'ala aali Sayyidina Muhammad, kamaa shallaita \'ala Sayyidina Ibraahima wa \'ala aali Sayyidina Ibraahiim, wa baarik \'ala Sayyidina Muhammad wa \'ala aali Sayyidina Muhammad, kamaa baarakta \'ala Sayyidina Ibraahima wa \'ala aali Sayyidina Ibraahiim, fil-\'aalamiina innaka Hamiidum-Majiid.',
    translation: 'Ya Allah, limpahkanlah selawat ke atas junjungan kami Nabi Muhammad dan ke atas keluarga baginda, sebagaimana Engkau telah melimpahkan selawat ke atas Nabi Ibrahim dan keluarga Nabi Ibrahim. Dan berkatilah junjungan kami Nabi Muhammad dan keluarga baginda, sebagaimana Engkau telah memberkati Nabi Ibrahim dan keluarga Nabi Ibrahim. Di seluruh alam ini, sesungguhnya Engkaulah Yang Maha Terpuji lagi Maha Mulia.',
    fadhilat: 'Selawat yang paling sempurna lafaznya. Mendatangkan 10 rahmat, menghapuskan 10 dosa dan mengangkat 10 darjat bagi setiap kali berselawat.'
  },
  {
    id: 'doa_kemaafan_afuwun',
    category: 'zikir',
    title: 'Doa Memohon Kemaafan Yang Sempurna',
    surahOrSource: 'Hadis Riwayat Tirmidzi',
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    transliteration: 'Allahumma innaka \'Afuwwun Kariimun tuhibbul-\'afwa fa\'fu \'annii.',
    translation: 'Ya Allah, sesungguhnya Engkau Maha Pemaaf lagi Maha Mulia, Engkau menyukai kemaafan, maka maafkanlah daku.',
    fadhilat: 'Doa yang diajarkan oleh Rasulullah ﷺ kepada Sayyidatina Aisyah R.Anha.'
  }
];

export const SAI_FIQH_GUIDE = {
  syaratSah: [
    {
      title: 'Didahului Dengan Tawaf Yang Sah',
      desc: 'Sa\'i hendaklah dikerjakan sejurus selepas selesai menyempurnakan 7 pusingan Tawaf Umrah (atau Tawaf Ifadhah).'
    },
    {
      title: 'Bermula di Bukit Safa & Tamat di Bukit Marwah',
      desc: 'Perjalanan MESTI dimulakan dari Bukit Safa dan diakhiri di Bukit Marwah pada pusingan ketujuh.'
    },
    {
      title: 'Genap 7 Pusingan dengan Yakin',
      desc: 'Kiraan pusingan: Safa ➔ Marwah (1), Marwah ➔ Safa (2), Safa ➔ Marwah (3), Marwah ➔ Safa (4), Safa ➔ Marwah (5), Marwah ➔ Safa (6), Safa ➔ Marwah (7).'
    },
    {
      title: 'Menempuh Sepanjang Jarak Laluan Mas\'a',
      desc: 'Mesti berjalan meliputi seluruh jarak antara kaki Bukit Safa dan kaki Bukit Marwah (tidak boleh memotong jalan di tengah-tengah).'
    },
    {
      title: 'Kekal Niat Sa\'i',
      desc: 'Tidak berniat keluar daripada ibadah Sa\'i atau bertujuan selain ibadah sepanjang menempuh laluan.'
    }
  ],
  sunnah: [
    {
      title: 'Suci Daripada Hadas (Sunat Berwuduk)',
      desc: 'Berwuduk adalah sunat muakkad ketika Sa\'i. Jika wuduk terbatal atau wanita didatangi haid/nifas SELEPAS Tawaf, Sa\'i mereka adalah tetap SAH di sisi syarak.'
    },
    {
      title: 'Harwalah (Berlari-Lari Anak) di Lampu Hijau',
      desc: 'Disunatkan khusus bagi kaum lelaki berlari anak dengan langkah pantas dan gagah di antara dua tiang garisan lampu hijau. Kaum wanita hanya berjalan biasa.'
    },
    {
      title: 'Mendaki & Menghadap Kaabah di Safa & Marwah',
      desc: 'Menaiki bukit sehingga nampak Kaabah (atau menghadap arah kiblat), mengangkat kedua tangan dan bertakbir serta berdoa 3 kali.'
    },
    {
      title: 'Muwalat (Berturut-turut)',
      desc: 'Disunatkan menyempurnakan pusingan tanpa terputus lama, kecuali sekiranya masuk waktu solat fardhu atau ingin minum air zamzam sekejap.'
    },
    {
      title: 'Berjalan Kaki Bagi Yang Berkemampuan',
      desc: 'Afdhal berjalan kaki sendiri. Namun penggunaan kerusi roda atau buggy dibenarkan dan sah bagi yang uzur, tua atau sakit.'
    }
  ]
};
