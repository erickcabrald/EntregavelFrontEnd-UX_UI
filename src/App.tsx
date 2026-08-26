  import { useState, useMemo } from "react"
  
  // ════════════════════════════════════════════════════════════
  // TYPES
  // ════════════════════════════════════════════════════════════
  
  type Screen =
    | { id: "login" }
    | { id: "register" }
    | { id: "home" }
    | { id: "results"; query: string }
    | { id: "product"; productId: string }
    | { id: "review-form"; productId: string }
    | { id: "review-confirm"; productId: string }
    | { id: "profile" }
  
  type PriceInd = "cheap" | "fair" | "expensive"
  
  interface Product {
    id: string
    name: string
    brand: string
    category: string
    image: string
    avgRating: number
    reviewCount: number
    avgPrice: number
    priceIndicator: PriceInd
    specs: string[]
    saved: boolean
    description: string
  }
  
  interface Review {
    id: string
    productId: string
    userId: string
    userName: string
    userAvatar: string
    rating: number
    pricePaid: number
    priceIndicator: PriceInd
    comment: string
    store: string
    date: string
    likes: number
    likedBy: string[]
  }
  
  // ════════════════════════════════════════════════════════════
  // HELPERS
  // ════════════════════════════════════════════════════════════
  
  function calcPriceInd(paid: number, avg: number): PriceInd {
    if (paid < avg * 0.93) return "cheap"
    if (paid > avg * 1.08) return "expensive"
    return "fair"
  }
  
  function fmtBRL(n: number) {
    return "R$ " + n.toLocaleString("pt-BR")
  }
  
  // ════════════════════════════════════════════════════════════
  // MOCK DATA
  // ════════════════════════════════════════════════════════════
  
  const INIT_PRODUCTS: Product[] = [
    {
      id: "rtx4090",
      name: "GeForce RTX 4090 ROG STRIX OC 24GB",
      brand: "ASUS",
      category: "GPU",
      image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&h=400&fit=crop&auto=format",
      avgRating: 4.8,
      reviewCount: 142,
      avgPrice: 8500,
      priceIndicator: "fair",
      specs: ["24GB GDDR6X", "Boost Clock 2640 MHz", "TDP 450W", "PCIe 4.0 x16", "DLSS 3.0"],
      saved: false,
      description: "A GPU mais poderosa do mercado para gaming em 4K com ray tracing. Ideal para criadores de conteúdo e gamers que exigem o máximo desempenho.",
    },
    {
      id: "ryzen7800x3d",
      name: "Ryzen 7 7800X3D",
      brand: "AMD",
      category: "CPU",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop&auto=format",
      avgRating: 4.9,
      reviewCount: 234,
      avgPrice: 1390,
      priceIndicator: "cheap",
      specs: ["8 cores / 16 threads", "Boost 5.0 GHz", "96MB 3D V-Cache", "TDP 120W", "Socket AM5"],
      saved: true,
      description: "O melhor processador para jogos graças à tecnologia exclusiva 3D V-Cache que entrega desempenho absurdo em títulos modernos.",
    },
    {
      id: "s24ultra",
      name: "Galaxy S24 Ultra 512GB",
      brand: "Samsung",
      category: "Celular",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop&auto=format",
      avgRating: 4.6,
      reviewCount: 389,
      avgPrice: 6200,
      priceIndicator: "expensive",
      specs: ["Snapdragon 8 Gen 3", "12GB RAM", "Câmera 200MP", "Display 6.8\" 120Hz QHD+", "Bateria 5000mAh"],
      saved: false,
      description: "Flagship da Samsung com S Pen integrada, câmera de 200MP e inteligência artificial avançada para fotos e produtividade.",
    },
    {
      id: "deathadder",
      name: "DeathAdder V3 Pro Wireless",
      brand: "Razer",
      category: "Mouse",
      image: "https://images.unsplash.com/photo-1527864393773-a456c3de649c?w=600&h=400&fit=crop&auto=format",
      avgRating: 4.7,
      reviewCount: 167,
      avgPrice: 550,
      priceIndicator: "fair",
      specs: ["63g ultraleve", "Sensor Focus Pro 30K DPI", "HyperSpeed Wireless", "Bateria 90h", "USB-C"],
      saved: false,
      description: "Mouse sem fio ultraleve com sensor de elite. Zero latência percebida, perfeito para FPS competitivo.",
    },
    {
      id: "lg27gp850",
      name: "UltraGear 27GP850-B 165Hz QHD",
      brand: "LG",
      category: "Monitor",
      image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=400&fit=crop&auto=format",
      avgRating: 4.5,
      reviewCount: 98,
      avgPrice: 1800,
      priceIndicator: "cheap",
      specs: ["27\" Nano IPS", "QHD 2560×1440", "165Hz / 1ms", "HDR10", "G-Sync Compatible"],
      saved: true,
      description: "Monitor gaming QHD com painel Nano IPS para cores precisas e 165Hz para máxima fluidez nos jogos.",
    },
    {
      id: "wh1000xm5",
      name: "WH-1000XM5",
      brand: "Sony",
      category: "Headset",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop&auto=format",
      avgRating: 4.7,
      reviewCount: 521,
      avgPrice: 1600,
      priceIndicator: "fair",
      specs: ["ANC líder de mercado", "Bateria 30h", "Hi-Res Audio", "Bluetooth 5.2 Multipoint", "USB-C"],
      saved: false,
      description: "Fone over-ear com o melhor cancelamento de ruído ativo do mercado e qualidade de áudio hi-fi.",
    },
    {
      id: "fury32gb",
      name: "Fury Beast 32GB DDR5 6000MHz",
      brand: "Kingston",
      category: "RAM",
      image: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&h=400&fit=crop&auto=format",
      avgRating: 4.4,
      reviewCount: 73,
      avgPrice: 450,
      priceIndicator: "fair",
      specs: ["32GB (2×16GB)", "DDR5-6000", "CL36", "XMP 3.0 / EXPO", "Baixo perfil"],
      saved: false,
      description: "Kit DDR5 de alto desempenho para plataformas Intel e AMD de nova geração. Ótimo custo-benefício.",
    },
    {
      id: "samsung990pro",
      name: "990 Pro 2TB NVMe PCIe 4.0",
      brand: "Samsung",
      category: "SSD",
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=400&fit=crop&auto=format",
      avgRating: 4.8,
      reviewCount: 189,
      avgPrice: 600,
      priceIndicator: "fair",
      specs: ["2TB capacidade", "Leitura 7450 MB/s", "Escrita 6900 MB/s", "PCIe 4.0 NVMe", "M.2 2280"],
      saved: false,
      description: "SSD NVMe mais rápido da Samsung. Ideal para gamers e profissionais que precisam de velocidade e confiabilidade.",
    },
  ]
  
  const INIT_REVIEWS: Review[] = [
    {
      id: "rev0", productId: "ryzen7800x3d", userId: "u1",
      userName: "João Gamer", userAvatar: "JG",
      rating: 5, pricePaid: 1370, priceIndicator: "cheap",
      comment: "Melhor compra que fiz em anos! FPS nos meus jogos favoritos aumentou absurdamente comparado ao meu antigo i7.",
      store: "Terabyte", date: "10/12/2024", likes: 12, likedBy: [],
    },
    {
      id: "rev1", productId: "rtx4090", userId: "u2",
      userName: "Carlos Mendes", userAvatar: "CM",
      rating: 5, pricePaid: 8200, priceIndicator: "cheap",
      comment: "Monstro absoluto! Rodando Cyberpunk 2077 em 4K Ultra com Ray Tracing máximo, manteve acima de 80fps com DLSS 3. Temperatura máxima 72°C em stress test de 1 hora. Vale cada centavo.",
      store: "KaBuM!", date: "15/11/2024", likes: 47, likedBy: [],
    },
    {
      id: "rev2", productId: "rtx4090", userId: "u3",
      userName: "Ana Beatriz", userAvatar: "AB",
      rating: 4, pricePaid: 9100, priceIndicator: "expensive",
      comment: "Excelente desempenho, mas paguei caro. Cooler silencioso e temperatura excelente. Para streaming + edição simultânea, é perfeita. Procure um preço melhor antes de comprar.",
      store: "Pichau", date: "22/10/2024", likes: 23, likedBy: [],
    },
    {
      id: "rev3", productId: "rtx4090", userId: "u8",
      userName: "Thiago Santos", userAvatar: "TS",
      rating: 5, pricePaid: 8450, priceIndicator: "fair",
      comment: "Atualização brutal em relação à RTX 3090 Ti. O Frame Generation do DLSS 3 praticamente dobra os FPS em jogos compatíveis. Altamente recomendado.",
      store: "Terabyte", date: "03/12/2024", likes: 31, likedBy: [],
    },
    {
      id: "rev4", productId: "ryzen7800x3d", userId: "u4",
      userName: "Pedro Alves", userAvatar: "PA",
      rating: 5, pricePaid: 1350, priceIndicator: "cheap",
      comment: "O 3D V-Cache faz diferença absurda! No CS2 meus FPS foram de 290 para mais de 540. Temperatura ótima com AIO 240mm. Rei absoluto para gaming, sem discussão.",
      store: "Amazon BR", date: "01/12/2024", likes: 89, likedBy: [],
    },
    {
      id: "rev5", productId: "ryzen7800x3d", userId: "u5",
      userName: "Lucas Ferreira", userAvatar: "LF",
      rating: 5, pricePaid: 1400, priceIndicator: "fair",
      comment: "Upgrade do 5800X que valeu muito a pena. Em produtividade a diferença é menor, mas em jogos é outro patamar completamente. Cooler box é ok para uso casual.",
      store: "Terabyte", date: "28/11/2024", likes: 34, likedBy: [],
    },
    {
      id: "rev6", productId: "s24ultra", userId: "u6",
      userName: "Fernanda Lima", userAvatar: "FL",
      rating: 5, pricePaid: 5800, priceIndicator: "cheap",
      comment: "Câmera de 200MP é surreal. Zoom 100x ainda com qualidade usável. S Pen super fluida para anotações. Display o mais bonito que já vi em celular. Bateria dura o dia tranquilo.",
      store: "Samsung Store", date: "10/09/2024", likes: 156, likedBy: [],
    },
    {
      id: "rev7", productId: "s24ultra", userId: "u9",
      userName: "Rodrigo Pinto", userAvatar: "RP",
      rating: 4, pricePaid: 6500, priceIndicator: "expensive",
      comment: "Aparelho incrível mas caro demais no Brasil. A IA Circle to Search é revolucionária no dia a dia. Galaxy AI para resumos é muito útil. Hardware não decepciona.",
      store: "Fast Shop", date: "25/08/2024", likes: 44, likedBy: [],
    },
    {
      id: "rev8", productId: "deathadder", userId: "u7",
      userName: "Rafael Costa", userAvatar: "RC",
      rating: 5, pricePaid: 520, priceIndicator: "cheap",
      comment: "63g sem fio é mágico. Zero diferença de latência para mouse com fio. Sensor Focus Pro 30K sem falhas em 300+ horas. Melhor mouse para FPS que já usei na vida.",
      store: "KaBuM!", date: "05/10/2024", likes: 67, likedBy: [],
    },
    {
      id: "rev9", productId: "lg27gp850", userId: "u10",
      userName: "Mariana Souza", userAvatar: "MS",
      rating: 4, pricePaid: 1650, priceIndicator: "cheap",
      comment: "Monitor excelente pelo preço. Nano IPS com cores fiéis, sem bleeding perceptível. 165Hz faz toda diferença em jogos rápidos. Custo-benefício excelente.",
      store: "Pichau", date: "18/10/2024", likes: 29, likedBy: [],
    },
    {
      id: "rev10", productId: "wh1000xm5", userId: "u11",
      userName: "Gustavo Neves", userAvatar: "GN",
      rating: 5, pricePaid: 1580, priceIndicator: "fair",
      comment: "Cancelamento de ruído é de outro nível. Em escritório aberto não escuto absolutamente nada. 30h de bateria é perfeito para viagens longas. Conforto impecável.",
      store: "Amazon BR", date: "12/11/2024", likes: 82, likedBy: [],
    },
  ]
  
  const CATEGORIES = ["Todos", "GPU", "CPU", "Celular", "Mouse", "Monitor", "RAM", "SSD", "Headset"]
  
  // ════════════════════════════════════════════════════════════
  // SHARED COMPONENTS
  // ════════════════════════════════════════════════════════════
  
  function Stars({ n, interactive = false, onChange }: { n: number; interactive?: boolean; onChange?: (v: number) => void }) {
    const [hov, setHov] = useState(0)
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => {
          const filled = s <= (hov || Math.round(n))
          return (
            <span
              key={s}
              onClick={interactive && onChange ? () => onChange(s) : undefined}
              onMouseEnter={interactive ? () => setHov(s) : undefined}
              onMouseLeave={interactive ? () => setHov(0) : undefined}
              className={`text-base leading-none transition-colors ${interactive ? "cursor-pointer" : "cursor-default"} ${filled ? "text-amber-400" : "text-slate-600"}`}
            >
              ★
            </span>
          )
        })}
      </div>
    )
  }
  
  function PriceBadge({ ind, size = "sm" }: { ind: PriceInd; size?: "sm" | "md" }) {
    const cfg = {
      cheap: { label: "BARATO", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
      fair: { label: "MÉDIO", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
      expensive: { label: "CARO", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
    }[ind]
    return (
      <span className={`inline-flex items-center border rounded font-mono font-bold tracking-widest ${size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"} ${cfg.cls}`}>
        {cfg.label}
      </span>
    )
  }
  
  function QualitySeal({ rating }: { rating: number }) {
    if (rating >= 4.7) {
      return (
        <div className="inline-flex items-center gap-1.5 bg-violet-500/15 border border-violet-500/30 text-violet-300 rounded-full px-3 py-1">
          <span className="text-xs">✦</span>
          <span className="text-xs font-semibold tracking-wide font-display">APROVADO PELA COMUNIDADE</span>
        </div>
      )
    }
    if (rating >= 4.4) {
      return (
        <div className="inline-flex items-center gap-1.5 bg-slate-500/15 border border-slate-500/30 text-slate-400 rounded-full px-3 py-1">
          <span className="text-xs">✓</span>
          <span className="text-xs font-semibold tracking-wide font-display">BEM AVALIADO</span>
        </div>
      )
    }
    return null
  }
  
  function SearchBar({ value, onChange, onSearch }: { value: string; onChange: (v: string) => void; onSearch: (q: string) => void }) {
    return (
      <form
        onSubmit={(e) => { e.preventDefault(); onSearch(value) }}
        className="flex-1 flex items-center bg-[#0f1825] border border-[#1e2d45] rounded-lg overflow-hidden focus-within:border-violet-500/60 transition-colors"
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="O que você busca?"
          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none"
        />
        <button type="submit" className="px-3 py-2 text-slate-400 hover:text-violet-400 transition-colors">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
        </button>
      </form>
    )
  }
  
  function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
    return (
      <button
        onClick={onClick}
        className="group bg-[#0f1825] border border-[#1e2d45] rounded-xl overflow-hidden hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-900/20 transition-all duration-200 text-left w-full"
      >
        <div className="relative overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1825]/90 via-transparent to-transparent" />
          <div className="absolute top-2 right-2">
            <PriceBadge ind={product.priceIndicator} />
          </div>
          <div className="absolute bottom-2 left-3">
            <span className="text-xs font-mono text-cyan-400 bg-[#0a0f1a]/80 backdrop-blur-sm px-2 py-0.5 rounded border border-cyan-500/20">
              {product.category}
            </span>
          </div>
        </div>
        <div className="p-3">
          <p className="text-xs text-slate-500 mb-0.5 font-mono">{product.brand}</p>
          <h3 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2 mb-2 font-display">{product.name}</h3>
          <div className="flex items-center gap-1.5 mb-2">
            <Stars n={product.avgRating} />
            <span className="text-xs text-amber-400 font-semibold">{product.avgRating.toFixed(1)}</span>
            <span className="text-xs text-slate-600">({product.reviewCount})</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-sm font-bold text-slate-100 font-mono">{fmtBRL(product.avgPrice)}</span>
            <span className="text-xs text-slate-600">preço médio</span>
          </div>
        </div>
      </button>
    )
  }
  
  function ProductListItem({ product, onClick }: { product: Product; onClick: () => void }) {
    return (
      <button
        onClick={onClick}
        className="group flex gap-4 bg-[#0f1825] border border-[#1e2d45] rounded-xl p-3 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-900/20 transition-all duration-200 text-left w-full items-start"
      >
        <div className="relative shrink-0 rounded-lg overflow-hidden w-24 h-20">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute bottom-1 left-1">
            <span className="text-[10px] font-mono text-cyan-400 bg-[#0a0f1a]/80 px-1.5 py-0.5 rounded">
              {product.category}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 font-mono mb-0.5">{product.brand}</p>
          <h3 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2 mb-1.5 font-display">{product.name}</h3>
          <div className="flex items-center gap-1.5 mb-2">
            <Stars n={product.avgRating} />
            <span className="text-xs text-amber-400 font-semibold">{product.avgRating.toFixed(1)}</span>
            <span className="text-xs text-slate-600">({product.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-100 font-mono">{fmtBRL(product.avgPrice)}</span>
            <PriceBadge ind={product.priceIndicator} />
          </div>
        </div>
      </button>
    )
  }
  
  function ReviewCard({ review, currentUserId, onLike }: { review: Review; currentUserId: string; onLike: (id: string) => void }) {
    const liked = review.likedBy.includes(currentUserId)
    return (
      <div className="bg-[#0f1825] border border-[#1e2d45] rounded-xl p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-violet-300 font-display">{review.userAvatar}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">{review.userName}</p>
              <p className="text-xs text-slate-500">{review.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Stars n={review.rating} />
            <span className="text-sm font-bold text-amber-400">{review.rating}.0</span>
          </div>
        </div>
  
        <p className="text-sm text-slate-300 leading-relaxed mb-3">{review.comment}</p>
  
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-slate-600">
                <path d="M8.75 3.75a.75.75 0 00-1.5 0v3.5h-3.5a.75.75 0 000 1.5h3.5v3.5a.75.75 0 001.5 0v-3.5h3.5a.75.75 0 000-1.5h-3.5v-3.5z" />
              </svg>
              <span className="font-mono">{fmtBRL(review.pricePaid)}</span>
              <PriceBadge ind={review.priceIndicator} />
            </div>
            <span className="text-xs text-slate-600">·</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-slate-600">
                <path fillRule="evenodd" d="M7.539 14.841a.75.75 0 01-.479 0 9.494 9.494 0 01-3.81-2.73C1.974 10.516 1.25 8.771 1.25 7a5.5 5.5 0 0111 0c0 1.77-.724 3.515-1.999 5.111a9.494 9.494 0 01-3.712 2.73z" clipRule="evenodd" />
              </svg>
              {review.store}
            </span>
          </div>
          <button
            onClick={() => onLike(review.id)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${liked ? "bg-violet-500/15 border-violet-500/40 text-violet-400" : "bg-transparent border-[#1e2d45] text-slate-500 hover:border-violet-500/40 hover:text-violet-400"}`}
          >
            <svg viewBox="0 0 16 16" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 2.668C6.73 1.687 8 1.687 8.3 2.668l.68 2.162a1 1 0 00.95.69h2.27c1.027 0 1.454 1.313.624 1.917l-1.837 1.333a1 1 0 00-.363 1.118l.7 2.162c.3.981-.806 1.8-1.636 1.196L7.85 12.115a1 1 0 00-1.173 0l-1.837 1.333c-.83.603-1.937-.215-1.636-1.196l.7-2.162a1 1 0 00-.363-1.118L1.703 7.437c-.83-.604-.403-1.917.624-1.917h2.27a1 1 0 00.95-.69l.68-2.162z" />
            </svg>
            <span>{review.likes}</span>
          </button>
        </div>
      </div>
    )
  }
  
  // ════════════════════════════════════════════════════════════
  // LAYOUT
  // ════════════════════════════════════════════════════════════
  
  function TopNav({
    navigate,
    searchInput,
    setSearchInput,
    onSearch,
    currentUser,
  }: {
    navigate: (s: Screen) => void
    searchInput: string
    setSearchInput: (v: string) => void
    onSearch: (q: string) => void
    currentUser: { name: string }
  }) {
    return (
      <header className="sticky top-0 z-50 bg-[#070b14]/95 backdrop-blur border-b border-[#1e2d45]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate({ id: "home" })}
            className="shrink-0 flex items-center gap-1.5 group"
          >
            <div className="w-7 h-7 rounded bg-violet-600 flex items-center justify-center">
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                <circle cx="6" cy="6" r="4" stroke="white" strokeWidth="1.5" />
                <path d="M9.5 9.5L13 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="6" cy="6" r="1.5" fill="white" />
              </svg>
            </div>
            <span className="text-lg font-black font-display text-slate-100 tracking-wider group-hover:text-violet-400 transition-colors">NEXO</span>
          </button>
  
          <SearchBar value={searchInput} onChange={setSearchInput} onSearch={onSearch} />
  
          <button
            onClick={() => navigate({ id: "profile" })}
            className="shrink-0 w-9 h-9 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center hover:bg-violet-600/50 transition-colors"
          >
            <span className="text-xs font-bold text-violet-300 font-display">
              {currentUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </span>
          </button>
        </div>
      </header>
    )
  }
  
  function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-violet-500 rounded-full" />
        <h2 className="text-base font-bold font-display text-slate-100 tracking-wide">{children}</h2>
      </div>
    )
  }
  
  // ════════════════════════════════════════════════════════════
  // SCREENS
  // ════════════════════════════════════════════════════════════
  
  function LoginScreen({ navigate }: { navigate: (s: Screen) => void }) {
    const [email, setEmail] = useState("")
    const [pass, setPass] = useState("")
  
    const inputCls = "w-full bg-[#0f1825] border border-[#1e2d45] rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-violet-500/60 transition-colors"
  
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.15), transparent)" }}
      >
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 rounded-xl bg-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-900/50">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <circle cx="9" cy="9" r="6" stroke="white" strokeWidth="2" />
                <path d="M14 14L20 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="9" cy="9" r="2.5" fill="white" />
              </svg>
            </div>
            <h1 className="text-3xl font-black font-display tracking-widest text-slate-100">NEXO</h1>
            <p className="text-slate-500 text-sm mt-1">Pesquise, compare e avalie hardware</p>
          </div>
  
          <div className="bg-[#0f1825] border border-[#1e2d45] rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">E-mail</label>
              <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Senha</label>
              <input type="password" placeholder="••••••••" value={pass} onChange={(e) => setPass(e.target.value)} className={inputCls} />
            </div>
            <button
              onClick={() => navigate({ id: "home" })}
              className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-bold py-2.5 rounded-lg transition-colors font-display tracking-wide text-sm"
            >
              Entrar
            </button>
            <div className="text-center pt-1">
              <span className="text-xs text-slate-600">Não tem conta? </span>
              <button onClick={() => navigate({ id: "register" })} className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                Criar conta
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  function RegisterScreen({ navigate }: { navigate: (s: Screen) => void }) {
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [pass, setPass] = useState("")
  
    const inputCls = "w-full bg-[#0f1825] border border-[#1e2d45] rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-violet-500/60 transition-colors"
  
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,58,237,0.15), transparent)" }}
      >
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 rounded-xl bg-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-900/50">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <circle cx="9" cy="9" r="6" stroke="white" strokeWidth="2" />
                <path d="M14 14L20 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="9" cy="9" r="2.5" fill="white" />
              </svg>
            </div>
            <h1 className="text-3xl font-black font-display tracking-widest text-slate-100">NEXO</h1>
            <p className="text-slate-500 text-sm mt-1">Crie sua conta gratuitamente</p>
          </div>
  
          <div className="bg-[#0f1825] border border-[#1e2d45] rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Nome de usuário</label>
              <input type="text" placeholder="seunickname" value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">E-mail</label>
              <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Senha</label>
              <input type="password" placeholder="mínimo 8 caracteres" value={pass} onChange={(e) => setPass(e.target.value)} className={inputCls} />
            </div>
            <button
              onClick={() => navigate({ id: "home" })}
              className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-bold py-2.5 rounded-lg transition-colors font-display tracking-wide text-sm"
            >
              Criar conta
            </button>
            <div className="text-center pt-1">
              <span className="text-xs text-slate-600">Já tem conta? </span>
              <button onClick={() => navigate({ id: "login" })} className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                Fazer login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  function HomeScreen({
    products,
    navigate,
  }: {
    products: Product[]
    navigate: (s: Screen) => void
  }) {
    const [activeCategory, setActiveCategory] = useState("Todos")
  
    const filtered = useMemo(() => {
      if (activeCategory === "Todos") return products
      return products.filter((p) => p.category === activeCategory)
    }, [products, activeCategory])
  
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold font-display tracking-wide border transition-all ${
                activeCategory === cat
                  ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-900/40"
                  : "bg-transparent border-[#1e2d45] text-slate-400 hover:border-violet-500/50 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
  
        {/* Featured section */}
        <SectionTitle>
          {activeCategory === "Todos" ? "Em Destaque" : activeCategory}
        </SectionTitle>
  
        {filtered.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-12">Nenhum produto nesta categoria ainda.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onClick={() => navigate({ id: "product", productId: p.id })} />
            ))}
          </div>
        )}
  
        {/* Trending by rating */}
        {activeCategory === "Todos" && (
          <div className="mt-10">
            <SectionTitle>Mais Avaliados</SectionTitle>
            <div className="flex flex-col gap-3">
              {[...products]
                .sort((a, b) => b.reviewCount - a.reviewCount)
                .slice(0, 4)
                .map((p) => (
                  <ProductListItem key={p.id} product={p} onClick={() => navigate({ id: "product", productId: p.id })} />
                ))}
            </div>
          </div>
        )}
      </div>
    )
  }
  
  function ResultsScreen({
    query,
    products,
    navigate,
  }: {
    query: string
    products: Product[]
    navigate: (s: Screen) => void
  }) {
    const results = useMemo(() => {
      const q = query.toLowerCase()
      return products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }, [query, products])
  
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-5">
          <p className="text-xs text-slate-500 font-mono mb-0.5">Resultados para</p>
          <h2 className="text-lg font-bold font-display text-slate-100">
            "{query}"
            <span className="ml-2 text-sm font-normal text-slate-500">{results.length} {results.length === 1 ? "produto" : "produtos"}</span>
          </h2>
        </div>
  
        {results.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-20">🔍</div>
            <p className="text-slate-400 font-semibold">Nenhum produto encontrado</p>
            <p className="text-slate-600 text-sm mt-1">Tente buscar por marca, modelo ou categoria</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {results.map((p) => (
              <ProductListItem key={p.id} product={p} onClick={() => navigate({ id: "product", productId: p.id })} />
            ))}
          </div>
        )}
      </div>
    )
  }
  
  function ProductScreen({
    product,
    reviews,
    currentUserId,
    onSave,
    onLike,
    navigate,
  }: {
    product: Product
    reviews: Review[]
    currentUserId: string
    onSave: (id: string) => void
    onLike: (reviewId: string) => void
    navigate: (s: Screen) => void
  }) {
    const productReviews = reviews.filter((r) => r.productId === product.id)
  
    const priceStats = useMemo(() => {
      const counts = { cheap: 0, fair: 0, expensive: 0 }
      productReviews.forEach((r) => counts[r.priceIndicator]++)
      return counts
    }, [productReviews])
  
    return (
      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Back */}
        <button
          onClick={() => navigate({ id: "home" })}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-5 transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 010 1.06L7.06 8l2.72 2.72a.75.75 0 11-1.06 1.06L5.47 8.53a.75.75 0 010-1.06l3.25-3.25a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
          Voltar
        </button>
  
        {/* Product image */}
        <div className="relative rounded-2xl overflow-hidden mb-5 bg-[#0f1825]">
          <img src={product.image} alt={product.name} className="w-full h-56 sm:h-72 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b14]/80 via-[#070b14]/20 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="text-xs font-mono text-cyan-400 bg-[#0a0f1a]/80 backdrop-blur-sm px-2.5 py-1 rounded border border-cyan-500/20">
              {product.category}
            </span>
          </div>
          <button
            onClick={() => onSave(product.id)}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center border transition-all ${
              product.saved
                ? "bg-violet-600/80 border-violet-500 text-white"
                : "bg-[#0a0f1a]/60 border-[#1e2d45] text-slate-400 hover:border-violet-500/50 hover:text-violet-400"
            }`}
          >
            <svg viewBox="0 0 16 16" fill={product.saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3.5A1.5 1.5 0 014.5 2h7A1.5 1.5 0 0113 3.5v10.055a.75.75 0 01-1.04.694L8 12.298l-3.96 1.951A.75.75 0 013 13.556V3.5z" />
            </svg>
          </button>
        </div>
  
        {/* Product info */}
        <div className="mb-5">
          <p className="text-xs font-mono text-slate-500 mb-0.5">{product.brand}</p>
          <h1 className="text-xl font-bold font-display text-slate-100 mb-3 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Stars n={product.avgRating} />
              <span className="text-base font-bold text-amber-400">{product.avgRating.toFixed(1)}</span>
              <span className="text-sm text-slate-500">({product.reviewCount} avaliações)</span>
            </div>
            <QualitySeal rating={product.avgRating} />
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{product.description}</p>
        </div>
  
        {/* Price section */}
        <div className="bg-[#0f1825] border border-[#1e2d45] rounded-xl p-4 mb-5">
          <p className="text-xs text-slate-500 mb-2 font-mono uppercase tracking-widest">Preço médio da comunidade</p>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-2xl font-black font-mono text-slate-100">{fmtBRL(product.avgPrice)}</span>
            <PriceBadge ind={product.priceIndicator} size="md" />
          </div>
          {productReviews.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#1e2d45] flex gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="font-mono font-bold">{priceStats.cheap}</span> pagaram barato
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="font-mono font-bold">{priceStats.fair}</span> preço justo
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="font-mono font-bold">{priceStats.expensive}</span> pagaram caro
              </span>
            </div>
          )}
        </div>
  
        {/* Specs */}
        <div className="mb-5">
          <SectionTitle>Especificações</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {product.specs.map((spec) => (
              <div key={spec} className="flex items-center gap-2 bg-[#0f1825] border border-[#1e2d45] rounded-lg px-3 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                <span className="text-sm text-slate-300 font-mono">{spec}</span>
              </div>
            ))}
          </div>
        </div>
  
        {/* Reviews header + CTA */}
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>
            Avaliações{productReviews.length > 0 && ` (${productReviews.length})`}
          </SectionTitle>
          <button
            onClick={() => navigate({ id: "review-form", productId: product.id })}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors font-display tracking-wide"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M8.75 3.75a.75.75 0 00-1.5 0v3.5h-3.5a.75.75 0 000 1.5h3.5v3.5a.75.75 0 001.5 0v-3.5h3.5a.75.75 0 000-1.5h-3.5v-3.5z" />
            </svg>
            Avaliar produto
          </button>
        </div>
  
        {/* Reviews list */}
        {productReviews.length === 0 ? (
          <div className="text-center py-10 bg-[#0f1825] border border-[#1e2d45] rounded-xl">
            <p className="text-slate-500 text-sm">Seja o primeiro a avaliar!</p>
            <p className="text-slate-600 text-xs mt-1">Compartilhe sua experiência com a comunidade.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-6">
            {productReviews
              .sort((a, b) => b.likes - a.likes)
              .map((r) => (
                <ReviewCard key={r.id} review={r} currentUserId={currentUserId} onLike={onLike} />
              ))}
          </div>
        )}
      </div>
    )
  }
  
  function ReviewFormScreen({
    product,
    currentUserId,
    currentUserName,
    onSubmit,
    navigate,
  }: {
    product: Product
    currentUserId: string
    currentUserName: string
    onSubmit: (review: Review) => void
    navigate: (s: Screen) => void
  }) {
    const [rating, setRating] = useState(0)
    const [pricePaid, setPricePaid] = useState("")
    const [comment, setComment] = useState("")
    const [store, setStore] = useState("")
  
    const priceNum = parseFloat(pricePaid.replace(",", "."))
    const ind = !isNaN(priceNum) && priceNum > 0 ? calcPriceInd(priceNum, product.avgPrice) : null
  
    const canSubmit = rating > 0 && comment.trim().length > 10 && store.trim().length > 0 && !isNaN(priceNum) && priceNum > 0
  
    const inputCls = "w-full bg-[#0f1825] border border-[#1e2d45] rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-violet-500/60 transition-colors"
  
    function handleSubmit() {
      if (!canSubmit) return
      const initials = currentUserName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
      const now = new Date()
      const date = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`
      onSubmit({
        id: "rev-" + Date.now(),
        productId: product.id,
        userId: currentUserId,
        userName: currentUserName,
        userAvatar: initials,
        rating,
        pricePaid: priceNum,
        priceIndicator: ind!,
        comment: comment.trim(),
        store: store.trim(),
        date,
        likes: 0,
        likedBy: [],
      })
    }
  
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <button
          onClick={() => navigate({ id: "product", productId: product.id })}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-5 transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 010 1.06L7.06 8l2.72 2.72a.75.75 0 11-1.06 1.06L5.47 8.53a.75.75 0 010-1.06l3.25-3.25a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
          Cancelar
        </button>
  
        <div className="mb-6">
          <h1 className="text-xl font-bold font-display text-slate-100 mb-1">Avaliar produto</h1>
          <p className="text-sm text-slate-500 line-clamp-1">{product.brand} · {product.name}</p>
        </div>
  
        <div className="space-y-5">
          {/* Rating */}
          <div className="bg-[#0f1825] border border-[#1e2d45] rounded-xl p-4">
            <label className="block text-xs font-medium text-slate-400 mb-3">Sua nota *</label>
            <div className="flex items-center gap-3">
              <div className="text-3xl">
                <Stars n={rating} interactive onChange={setRating} />
              </div>
              {rating > 0 && (
                <span className="text-sm font-bold text-amber-400 font-mono">
                  {["", "Péssimo", "Ruim", "Regular", "Bom", "Excelente"][rating]}
                </span>
              )}
            </div>
          </div>
  
          {/* Price paid */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Preço que você pagou (R$) *</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder={`Média: ${fmtBRL(product.avgPrice)}`}
                value={pricePaid}
                onChange={(e) => setPricePaid(e.target.value)}
                className={inputCls + " flex-1"}
              />
              {ind && <PriceBadge ind={ind} size="md" />}
            </div>
            {ind && (
              <p className={`text-xs mt-1.5 font-mono ${ind === "cheap" ? "text-emerald-400" : ind === "fair" ? "text-amber-400" : "text-red-400"}`}>
                {ind === "cheap" ? "✓ Você pagou abaixo da média!" : ind === "fair" ? "~ Preço dentro da média" : "✗ Você pagou acima da média"}
              </p>
            )}
          </div>
  
          {/* Store */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Loja / local de compra *</label>
            <input
              type="text"
              placeholder="ex: KaBuM!, Amazon, Pichau, Terabyte..."
              value={store}
              onChange={(e) => setStore(e.target.value)}
              className={inputCls}
            />
          </div>
  
          {/* Comment */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Comentário *
              <span className={`ml-2 text-xs font-mono ${comment.length < 10 ? "text-slate-600" : "text-emerald-500"}`}>
                {comment.length}/10 mín
              </span>
            </label>
            <textarea
              placeholder="Compartilhe sua experiência com o produto. Desempenho, qualidade, entrega..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className={inputCls + " resize-none"}
            />
          </div>
  
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full font-bold py-3 rounded-lg transition-all font-display tracking-wide text-sm ${
              canSubmit
                ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40"
                : "bg-[#0f1825] border border-[#1e2d45] text-slate-600 cursor-not-allowed"
            }`}
          >
            Publicar avaliação
          </button>
        </div>
      </div>
    )
  }
  
  function ReviewConfirmScreen({ productId, navigate }: { productId: string; navigate: (s: Screen) => void }) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div
          className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-6"
          style={{ boxShadow: "0 0 40px rgba(16,185,129,0.2)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-2xl font-black font-display text-slate-100 mb-2">Avaliação publicada!</h2>
        <p className="text-slate-400 text-sm mb-1">Obrigado por contribuir com a comunidade NEXO.</p>
        <p className="text-slate-600 text-xs mb-8">Sua nota já está visível na ficha do produto.</p>
        <button
          onClick={() => navigate({ id: "product", productId })}
          className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-3 rounded-xl transition-colors font-display tracking-wide text-sm"
        >
          Ver ficha do produto
        </button>
      </div>
    )
  }
  
  function ProfileScreen({
    currentUser,
    products,
    reviews,
    navigate,
    onSave,
  }: {
    currentUser: { id: string; name: string; email: string }
    products: Product[]
    reviews: Review[]
    navigate: (s: Screen) => void
    onSave: (id: string) => void
  }) {
    const [tab, setTab] = useState<"reviews" | "saved">("reviews")
  
    const myReviews = reviews.filter((r) => r.userId === currentUser.id)
    const savedProducts = products.filter((p) => p.saved)
  
    const initials = currentUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2)
  
    const tabBtnCls = (active: boolean) =>
      `flex-1 py-2.5 text-sm font-bold font-display tracking-wide transition-all border-b-2 ${
        active ? "text-violet-400 border-violet-500" : "text-slate-500 border-transparent hover:text-slate-300"
      }`
  
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile header */}
        <div className="flex items-center gap-5 mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border border-violet-500/30"
            style={{ background: "linear-gradient(135deg, #4c1d95, #7c3aed)" }}
          >
            <span className="text-xl font-black font-display text-white">{initials}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-100">{currentUser.name}</h1>
            <p className="text-sm text-slate-500">{currentUser.email}</p>
            <div className="flex gap-4 mt-2">
              <span className="text-xs text-slate-400">
                <span className="font-bold text-violet-400 font-mono">{myReviews.length}</span> avaliações
              </span>
              <span className="text-xs text-slate-400">
                <span className="font-bold text-violet-400 font-mono">{savedProducts.length}</span> salvos
              </span>
            </div>
          </div>
        </div>
  
        {/* Tabs */}
        <div className="flex border-b border-[#1e2d45] mb-5">
          <button className={tabBtnCls(tab === "reviews")} onClick={() => setTab("reviews")}>
            Minhas Avaliações
          </button>
          <button className={tabBtnCls(tab === "saved")} onClick={() => setTab("saved")}>
            Produtos Salvos
          </button>
        </div>
  
        {/* Tab content */}
        {tab === "reviews" ? (
          myReviews.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-400 text-sm font-semibold">Nenhuma avaliação ainda</p>
              <p className="text-slate-600 text-xs mt-1">Encontre um produto e compartilhe sua experiência!</p>
              <button
                onClick={() => navigate({ id: "home" })}
                className="mt-5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors font-display"
              >
                Explorar produtos
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myReviews.map((rev) => {
                const prod = products.find((p) => p.id === rev.productId)
                return (
                  <div key={rev.id} className="bg-[#0f1825] border border-[#1e2d45] rounded-xl overflow-hidden">
                    {prod && (
                      <button
                        onClick={() => navigate({ id: "product", productId: prod.id })}
                        className="flex items-center gap-3 px-4 pt-4 pb-3 w-full text-left hover:bg-[#162035] transition-colors"
                      >
                        <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-xs font-mono text-slate-500">{prod.brand} · {prod.category}</p>
                          <p className="text-sm font-semibold text-slate-200 leading-tight line-clamp-1">{prod.name}</p>
                        </div>
                      </button>
                    )}
                    <div className="px-4 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Stars n={rev.rating} />
                          <span className="text-xs text-amber-400 font-bold">{rev.rating}.0</span>
                        </div>
                        <span className="text-xs text-slate-600">{rev.date}</span>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2">{rev.comment}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <PriceBadge ind={rev.priceIndicator} />
                        <span className="text-xs font-mono text-slate-500">{fmtBRL(rev.pricePaid)}</span>
                        <span className="text-xs text-slate-600">· {rev.store}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : savedProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-sm font-semibold">Nenhum produto salvo</p>
            <p className="text-slate-600 text-xs mt-1">Salve produtos para acessar rapidamente depois.</p>
            <button
              onClick={() => navigate({ id: "home" })}
              className="mt-5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-colors font-display"
            >
              Explorar produtos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {savedProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate({ id: "product", productId: p.id })}
                className="group relative rounded-xl overflow-hidden aspect-square bg-[#0f1825] border border-[#1e2d45] hover:border-violet-500/50 transition-colors"
              >
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b14]/80 via-transparent to-transparent" />
                <p className="absolute bottom-0 left-0 right-0 px-2 pb-2 text-xs font-semibold text-slate-200 font-display leading-tight line-clamp-2">
                  {p.name}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); onSave(p.id) }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#0a0f1a]/80 flex items-center justify-center text-violet-400 hover:bg-violet-600 hover:text-white transition-all"
                >
                  <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3">
                    <path d="M7 1.75a.75.75 0 00-1.5 0V5H2a.75.75 0 000 1.5h3.5V10a.75.75 0 001.5 0V6.5H10A.75.75 0 0010 5H7V1.75z" />
                  </svg>
                </button>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
  
  // ════════════════════════════════════════════════════════════
  // APP
  // ════════════════════════════════════════════════════════════
  
  const MOCK_USER = { id: "u1", name: "João Gamer", email: "joao@nexo.app" }
  
  export default function App() {
    const [screen, setScreen] = useState<Screen>({ id: "login" })
    const [products, setProducts] = useState<Product[]>(INIT_PRODUCTS)
    const [reviews, setReviews] = useState<Review[]>(INIT_REVIEWS)
    const [searchInput, setSearchInput] = useState("")
  
    const navigate = (s: Screen) => {
      setScreen(s)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  
    const handleSearch = (q: string) => {
      if (!q.trim()) return
      navigate({ id: "results", query: q.trim() })
      setSearchInput("")
    }
  
    const handleSave = (productId: string) => {
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, saved: !p.saved } : p)))
    }
  
    const handleLike = (reviewId: string) => {
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id !== reviewId) return r
          const liked = r.likedBy.includes(MOCK_USER.id)
          return {
            ...r,
            likes: liked ? r.likes - 1 : r.likes + 1,
            likedBy: liked ? r.likedBy.filter((id) => id !== MOCK_USER.id) : [...r.likedBy, MOCK_USER.id],
          }
        })
      )
    }
  
    const handleReviewSubmit = (review: Review) => {
      setReviews((prev) => [review, ...prev])
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== review.productId) return p
          const allRevs = [review, ...reviews.filter((r) => r.productId === p.id)]
          const avgR = allRevs.reduce((s, r) => s + r.rating, 0) / allRevs.length
          const avgP = allRevs.reduce((s, r) => s + r.pricePaid, 0) / allRevs.length
          return {
            ...p,
            avgRating: Math.round(avgR * 10) / 10,
            reviewCount: allRevs.length,
            avgPrice: Math.round(avgP),
            priceIndicator: calcPriceInd(avgP, p.avgPrice),
          }
        })
      )
      navigate({ id: "review-confirm", productId: review.productId })
    }
  
    // Auth screens (no nav)
    if (screen.id === "login") return <LoginScreen navigate={navigate} />
    if (screen.id === "register") return <RegisterScreen navigate={navigate} />
  
    // Authenticated layout
    const currentProduct =
      (screen.id === "product" || screen.id === "review-form" || screen.id === "review-confirm") && screen.productId
        ? products.find((p) => p.id === screen.productId) ?? null
        : null
  
    return (
      <div className="min-h-screen bg-[#070b14]">
        <TopNav
          navigate={navigate}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={handleSearch}
          currentUser={MOCK_USER}
        />
  
        <main>
          {screen.id === "home" && (
            <HomeScreen products={products} navigate={navigate} />
          )}
  
          {screen.id === "results" && (
            <ResultsScreen query={screen.query} products={products} navigate={navigate} />
          )}
  
          {screen.id === "product" && currentProduct && (
            <ProductScreen
              product={currentProduct}
              reviews={reviews}
              currentUserId={MOCK_USER.id}
              onSave={handleSave}
              onLike={handleLike}
              navigate={navigate}
            />
          )}
  
          {screen.id === "review-form" && currentProduct && (
            <ReviewFormScreen
              product={currentProduct}
              currentUserId={MOCK_USER.id}
              currentUserName={MOCK_USER.name}
              onSubmit={handleReviewSubmit}
              navigate={navigate}
            />
          )}
  
          {screen.id === "review-confirm" && screen.productId && (
            <ReviewConfirmScreen productId={screen.productId} navigate={navigate} />
          )}
  
          {screen.id === "profile" && (
            <ProfileScreen
              currentUser={MOCK_USER}
              products={products}
              reviews={reviews}
              navigate={navigate}
              onSave={handleSave}
            />
          )}
        </main>
      </div>
    )
  }
