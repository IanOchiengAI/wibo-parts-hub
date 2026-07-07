interface QualityBadgeProps {
  tier: "genuine" | "oem" | "aftermarket" | "ex-japan";
}

const TIER_CONFIG = {
  genuine:     { label: "Genuine",    classes: "bg-green-500/20  text-green-400  border-green-500/30"  },
  oem:         { label: "OEM",        classes: "bg-blue-500/20   text-blue-400   border-blue-500/30"   },
  aftermarket: { label: "Aftermarket",classes: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  "ex-japan":  { label: "Ex-Japan",   classes: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

const QualityBadge = ({ tier }: QualityBadgeProps) => {
  const config = TIER_CONFIG[tier] ?? TIER_CONFIG.oem;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-display font-semibold border ${config.classes}`}
    >
      {config.label}
    </span>
  );
};

export default QualityBadge;
