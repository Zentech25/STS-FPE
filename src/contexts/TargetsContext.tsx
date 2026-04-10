import imgFig120cm from "@/assets/targets/Fig120cm.jpg";
import imgFig120x4 from "@/assets/targets/Fig120x4.jpg";
import imgSmallBlue from "@/assets/targets/small_target_blue.jpg";
import imgSmallRed from "@/assets/targets/small_target_red.jpg";
import imgSPG from "@/assets/targets/SPGTarget.jpg";
import imgTarget3 from "@/assets/targets/Target_3.jpg";
import imgFig11 from "@/assets/targets/Fig11.jpg";
import imgFig11Line from "@/assets/targets/Fig11_Line.jpg";
import imgFig12 from "@/assets/targets/Fig12.jpg";

import zmFig120cm from "@/assets/targets/zones/Fig120cm_Color.png";
import zmFig120x4 from "@/assets/targets/zones/Fig120x4_Color.png";
import zmFig11 from "@/assets/targets/zones/Fig11_Color.png";
import zmFig11Line from "@/assets/targets/zones/Fig11_Line_Color.png";
import zmFig12 from "@/assets/targets/zones/Fig12_Color.png";
import zmSPG from "@/assets/targets/zones/SPGTarget_color.png";
import zmTarget3 from "@/assets/targets/zones/Target_3_color.png";
import zmSmallBlue from "@/assets/targets/zones/small_target_blue0.jpg";
import zmSmallRed from "@/assets/targets/zones/small_target_red0.jpg";

export interface ZoneColor {
  zone: number;
  color: string;
  label: string;
}

export interface TargetType {
  id: string;
  label: string;
  image: string;
  zones: number;
  zoneMap?: string;
  zoneColors?: ZoneColor[];
}

export const TARGETS: TargetType[] = [
  {
    id: "fig120cm", label: "Fig 120cm (Concentric)", image: imgFig120cm, zones: 10,
    zoneMap: zmFig120cm,
    zoneColors: [
      { zone: 1, color: "#0000ff", label: "Bull (Inner)" },
      { zone: 2, color: "#00ff00", label: "Inner 2" },
      { zone: 3, color: "#ff0000", label: "Inner 3" },
      { zone: 4, color: "#ffff00", label: "Ring 4" },
      { zone: 5, color: "#ff00ff", label: "Ring 5" },
      { zone: 6, color: "#00ffff", label: "Ring 6" },
      { zone: 7, color: "#0096c8", label: "Ring 7" },
      { zone: 8, color: "#646432", label: "Ring 8" },
      { zone: 9, color: "#003264", label: "Ring 9" },
      { zone: 10, color: "#ff7300", label: "Outer 10" },
    ],
  },
  {
    id: "fig120x4", label: "Fig 120 Bullseye", image: imgFig120x4, zones: 10,
    zoneMap: zmFig120x4,
    zoneColors: [
      { zone: 1, color: "#00ff00", label: "Bull (Inner)" },
      { zone: 2, color: "#0000ff", label: "Inner 2" },
      { zone: 3, color: "#ffff00", label: "Ring 3" },
      { zone: 4, color: "#ff00ff", label: "Ring 4" },
      { zone: 5, color: "#00ffff", label: "Ring 5" },
      { zone: 6, color: "#003264", label: "Ring 6" },
      { zone: 7, color: "#0096c8", label: "Ring 7" },
      { zone: 8, color: "#646432", label: "Ring 8" },
      { zone: 9, color: "#ff7300", label: "Ring 9" },
      { zone: 10, color: "#1e9632", label: "Outer 10" },
    ],
  },
  {
    id: "fig11", label: "Fig 11 Soldier", image: imgFig11, zones: 6,
    zoneMap: zmFig11,
    zoneColors: [
      { zone: 1, color: "#0000ff", label: "Bull (Inner)" },
      { zone: 2, color: "#00ff00", label: "Inner 2" },
      { zone: 3, color: "#ff0000", label: "Inner 3" },
      { zone: 4, color: "#ffff00", label: "Ring 4" },
      { zone: 5, color: "#ff00ff", label: "Ring 5" },
      { zone: 6, color: "#00ffff", label: "Ring 6" },
    ],
  },
  {
    id: "fig11-line", label: "Fig 11 Line Target", image: imgFig11Line, zones: 4,
    zoneMap: zmFig11Line,
    zoneColors: [
      { zone: 1, color: "#ff0000", label: "Center" },
      { zone: 2, color: "#00ff00", label: "Inner" },
      { zone: 3, color: "#0000ff", label: "Middle" },
      { zone: 4, color: "#ffff00", label: "Outer" },
    ],
  },
  {
    id: "fig12", label: "Fig 12 Silhouette", image: imgFig12, zones: 2,
    zoneMap: zmFig12,
    zoneColors: [
      { zone: 1, color: "#ff0000", label: "Center" },
      { zone: 2, color: "#00ff00", label: "Body" },
    ],
  },
  {
    id: "spg", label: "SPG Target", image: imgSPG, zones: 3,
    zoneMap: zmSPG,
    zoneColors: [
      { zone: 1, color: "#ff0000", label: "Bull" },
      { zone: 2, color: "#00ff00", label: "Inner" },
      { zone: 3, color: "#0000ff", label: "Outer" },
    ],
  },
  {
    id: "target3", label: "Hostage / No-Shoot", image: imgTarget3, zones: 2,
    zoneMap: zmTarget3,
    zoneColors: [
      { zone: 1, color: "#ff0000", label: "Hostage-Taker" },
      { zone: 2, color: "#00ff00", label: "Hostage (No-Shoot)" },
    ],
  },
  {
    id: "small-blue", label: "Small Target (Blue)", image: imgSmallBlue, zones: 3,
    zoneMap: zmSmallBlue,
    zoneColors: [
      { zone: 1, color: "#bcbcbc", label: "Lower" },
      { zone: 2, color: "#95cceb", label: "Upper" },
      { zone: 3, color: "#ffffff", label: "Background" },
    ],
  },
  {
    id: "small-red", label: "Small Target (Red)", image: imgSmallRed, zones: 3,
    zoneMap: zmSmallRed,
    zoneColors: [
      { zone: 1, color: "#9b9b9b", label: "Lower" },
      { zone: 2, color: "#e0b9ba", label: "Upper" },
      { zone: 3, color: "#ffffff", label: "Background" },
    ],
  },
];

export function getTargetById(id: string): TargetType | undefined {
  return TARGETS.find((t) => t.id === id);
}
