// Mock data — hardcoded, no network. Small enough to keep in-repo.

export type Level = "good" | "medium" | "low" | "weak" | "unknown";
export type Verdict =
  | { kind: "strong"; score: number; label: "Güçlü konumda" }
  | { kind: "good"; score: number; label: "Umut verici" }
  | { kind: "medium"; score: number; label: "Temkinli yaklaş" }
  | { kind: "weak"; score: number; label: "Riskli" }
  | { kind: "eliminated"; score: number; label: "Yatırıma uygun değil" }
  | { kind: "unknown"; label: "Yeterli veri yok" };

export interface StatusCard {
  title: string;
  level: Level;
  levelLabel: string;
  body: string;
  unchecked: string[];
}

export interface ResultData {
  parcel: { province: string; district: string; neighbourhood: string; ada: string; parsel: string };
  verdict: Verdict;
  summary: string;
  cards: StatusCard[];
  questions: string[];
  sources: { label: string; note: string }[];
}

export const provinces = [
  "Adana", "Ankara", "Antalya", "Aydın", "Balıkesir", "Bursa", "Çanakkale",
  "Denizli", "Diyarbakır", "Edirne", "Erzurum", "Eskişehir", "Gaziantep",
  "Hatay", "İstanbul", "İzmir", "Kayseri", "Kocaeli", "Konya", "Manisa",
  "Mersin", "Muğla", "Sakarya", "Samsun", "Tekirdağ", "Trabzon", "Şanlıurfa",
];

export const districtsByProvince: Record<string, string[]> = {
  "İstanbul": ["Beykoz", "Beyoğlu", "Çatalca", "Kadıköy", "Kartal", "Şile", "Silivri", "Üsküdar"],
  "İzmir": ["Bornova", "Buca", "Çeşme", "Karşıyaka", "Menderes", "Seferihisar", "Urla"],
  "Muğla": ["Bodrum", "Datça", "Fethiye", "Marmaris", "Milas", "Ortaca", "Ula"],
  "Antalya": ["Aksu", "Alanya", "Demre", "Kaş", "Kepez", "Konyaaltı", "Manavgat", "Serik"],
  "Çanakkale": ["Ayvacık", "Bozcaada", "Eceabat", "Ezine", "Gelibolu", "Merkez"],
  "Balıkesir": ["Ayvalık", "Bandırma", "Burhaniye", "Edremit", "Erdek", "Gömeç"],
  "Ankara": ["Ayaş", "Beypazarı", "Çankaya", "Etimesgut", "Gölbaşı", "Kızılcahamam"],
};

export const neighbourhoodsByDistrict: Record<string, string[]> = {
  "Şile": ["Ağva", "Balibey", "Doğancılı", "Kalem", "Kumbaba", "Meşrutiyet", "Yeşilvadi"],
  "Urla": ["Balıklıova", "Denizli", "Gülbahçe", "Kalabak", "Özbek", "Yağcılar", "Zeytineli"],
  "Bodrum": ["Bitez", "Gümüşlük", "Konacık", "Ortakent", "Turgutreis", "Yalıkavak", "Yalı"],
  "Kaş": ["Çukurbağ", "Gelemiş", "Kalkan", "Kınık", "Ova", "Sarıbelen"],
  "Ayvacık": ["Assos", "Behramkale", "Küçükkuyu", "Sazlı", "Tuzla", "Yeşilyurt"],
  "Ayvalık": ["Altınova", "Cunda", "Küçükköy", "Sarımsaklı"],
  "Beypazarı": ["Bağözü", "Çayırhan", "Hırkatepe", "Kızılcasöğüt", "Uruş"],
};

// Three result variants
export const results: Record<"a" | "b" | "c", ResultData> = {
  a: {
    parcel: { province: "İzmir", district: "Urla", neighbourhood: "Zeytineli", ada: "184", parsel: "27" },
    verdict: { kind: "strong", score: 98, label: "Güçlü konumda" },
    summary:
      "Parsel yürürlükteki uygulama imar planında konut kullanımına ayrılmış. Tapu üzerinde takyidat görünmüyor. Çevrede yakın tarihli plan değişikliği kaydına rastlanmadı.",
    cards: [
      {
        title: "İmar planı durumu",
        level: "good",
        levelLabel: "Uygun",
        body: "Uygulama imar planında konut alanı. Yapılaşma koşulları belirlenmiş.",
        unchecked: ["Kesin proje onayı", "Ruhsat aşamasındaki askı süreçleri"],
      },
      {
        title: "Çevredeki plan hareketliliği",
        level: "good",
        levelLabel: "Sakin",
        body: "Son iki yılda 500 m çevresinde askıya çıkmış plan değişikliği görünmüyor.",
        unchecked: ["Belediye meclisinde bekleyen taslak kararlar"],
      },
      {
        title: "Arazinin fiziksel durumu",
        level: "medium",
        levelLabel: "Kısmi",
        body: "Eğim düşük, ulaşım mevcut. Zemin etüdü için veri bulunamadı.",
        unchecked: ["Yerinde zemin etüdü", "Tarımsal toprak sınıfı"],
      },
      {
        title: "Tapu ve hukuki durum",
        level: "good",
        levelLabel: "Temiz",
        body: "Kayıt üzerinde ipotek, haciz veya şerh görünmüyor.",
        unchecked: ["Devam eden mahkeme dosyaları", "Mirasçı ihtilafları"],
      },
    ],
    questions: [
      "Elinizde son 6 aya ait güncel tapu kaydı var mı?",
      "Parsele ait imar durum belgesi hangi tarihte alındı?",
      "Zemin etüdü yapıldı mı, raporu görebilir miyim?",
      "Sınır komşularıyla yazılı bir anlaşmazlık kaydı var mı?",
    ],
    sources: [
      { label: "Tapu ve Kadastro", note: "Parsel sorgusu, kayıt görüntüsü" },
      { label: "Belediye imar müdürlüğü", note: "Uygulama imar planı paftası" },
      { label: "Resmi Gazete arşivi", note: "Plan askı ilanları taraması" },
    ],
  },

  b: {
    parcel: { province: "Muğla", district: "Bodrum", neighbourhood: "Gümüşlük", ada: "412", parsel: "3" },
    verdict: { kind: "eliminated", score: 0, label: "Yatırıma uygun değil" },
    summary:
      "Parsel yürürlükteki 1/1000 planda kesin korunacak hassas alan olarak işlenmiş. Yapılaşma bu alan tanımı altında yasal olarak yapılamaz. Bu bulgu tek başına eleyicidir.",
    cards: [
      {
        title: "İmar planı durumu",
        level: "weak",
        levelLabel: "Elverişsiz",
        body: "Kesin korunacak hassas alan. Bu tanım altında konut, ticaret veya turizm yapılaşması yapılamaz.",
        unchecked: ["Alan tanımının ileride değişme olasılığı — tahmin edilemez"],
      },
      {
        title: "Çevredeki plan hareketliliği",
        level: "medium",
        levelLabel: "Belirsiz",
        body: "Yakın çevrede askıya çıkmış plan taslakları var. Parsele etkisi kayıtlardan çıkarılamıyor.",
        unchecked: ["Taslakların nihai hali", "Meclis onay takvimi"],
      },
      {
        title: "Arazinin fiziksel durumu",
        level: "unknown",
        levelLabel: "Kontrol edilemedi",
        body: "Bu alan için açık zemin ve topografya verisi yayımlanmamış.",
        unchecked: ["Zemin sınıfı", "Eğim ve heyelan verisi", "Ulaşım yolu tescil durumu"],
      },
      {
        title: "Tapu ve hukuki durum",
        level: "medium",
        levelLabel: "İncelensin",
        body: "Kayıt üzerinde bir şerh görünüyor. Şerhin niteliği çevrimiçi kayıttan okunamıyor.",
        unchecked: ["Şerhin dayanağı ve kaldırılma koşulu"],
      },
    ],
    questions: [
      "Parselin bu alan tanımı satıcıya bildirildi mi?",
      "Tapudaki şerhin dayanak belgesini gösterebilir misiniz?",
      "Alanın koruma statüsünün kaldırılacağına dair yazılı bir vaat var mı?",
      "Yakındaki plan taslaklarından haberdar mısınız?",
    ],
    sources: [
      { label: "Tapu ve Kadastro", note: "Parsel sorgusu, şerh kaydı" },
      { label: "Çevre ve Şehircilik Bakanlığı", note: "Koruma alanı sınırları" },
      { label: "Belediye imar müdürlüğü", note: "1/1000 uygulama planı" },
    ],
  },

  c: {
    parcel: { province: "Çanakkale", district: "Ayvacık", neighbourhood: "Sazlı", ada: "76", parsel: "12" },
    verdict: { kind: "unknown", label: "Yeterli veri yok" },
    summary:
      "Parselin bulunduğu bölgede kamuya açık plan ve tapu verisi çevrimiçi olarak yayımlanmıyor. Bulguya dayalı bir puan verilemez. Aşağıdaki kontroller yerinde ve kurumdan yapılmalı.",
    cards: [
      {
        title: "İmar planı durumu",
        level: "unknown",
        levelLabel: "Kontrol edilemedi",
        body: "Bu belediyeye ait dijital plan yayımı bulunamadı.",
        unchecked: ["Yürürlükteki plan tanımı", "Yapılaşma koşulları", "Askı süreçleri"],
      },
      {
        title: "Çevredeki plan hareketliliği",
        level: "unknown",
        levelLabel: "Kontrol edilemedi",
        body: "Askı ilanları için taranabilir dijital arşiv görünmüyor.",
        unchecked: ["Askıdaki değişiklikler", "Meclis kararları"],
      },
      {
        title: "Arazinin fiziksel durumu",
        level: "low",
        levelLabel: "Sınırlı",
        body: "Uydu görüntüsünden ulaşım yolu tespit edildi. Eğim belirgin değil.",
        unchecked: ["Zemin etüdü", "Tarımsal toprak sınıfı", "Yol tescil durumu"],
      },
      {
        title: "Tapu ve hukuki durum",
        level: "unknown",
        levelLabel: "Kontrol edilemedi",
        body: "Tapu kaydı çevrimiçi sorguya kapalı. Yerinde kayıt istenmeli.",
        unchecked: ["İpotek, haciz, şerhler", "Devam eden davalar"],
      },
    ],
    questions: [
      "Güncel tapu kaydını elden gösterebilir misiniz?",
      "Belediyeden alınmış imar durum belgesi var mı?",
      "Parsele ulaşan yolun tescil durumu biliniyor mu?",
      "Bölgede son bir yılda yapılan plan çalışması duydunuz mu?",
    ],
    sources: [
      { label: "Tapu ve Kadastro", note: "Çevrimiçi kayıt bulunamadı" },
      { label: "Belediye imar müdürlüğü", note: "Dijital plan yayımı yok" },
      { label: "Uydu görüntüsü", note: "Kamuya açık görüntü taraması" },
    ],
  },
};
