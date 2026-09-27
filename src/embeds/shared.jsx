// Shared design tokens, data, and small components used by the standalone
// /embed/* pages. Each embed page (BrandRankingsFull.jsx, EvPopulation.jsx, ...)
// is its own lazy-loaded chunk (see main.jsx) so a Wix visitor loading one embed
// does not download the whole dashboard bundle. This file holds only what those
// embeds actually need, kept in sync with the equivalent data in App.jsx.
import React, { useState } from 'react';

// ============ WORLD MOBILITY FORUM BRAND PALETTE ============
export const BLUE       = '#22C8C8';   // Tiffany Blue — brand primary (buttons, links, highlights)
export const BLUE_LIGHT = '#E3FAFA';   // Tiffany surface tint
export const RED        = '#E5484D';   // Alert/negative (functional, not brand core)
export const RED_LIGHT  = '#FDEBEC';
export const YELLOW     = '#FFB648';   // Amber — highlights, awards, events
export const YELLOW_LIGHT = '#FFF6E8';
export const GREEN      = '#32D17B';   // Success — growth, renewables, positive metrics
export const GREEN_LIGHT = '#EAFBF1';
export const INK        = '#111827';   // Dark heading
export const SECONDARY  = '#5B6470';   // Body text
export const SURFACE    = '#F7F8FA';   // Light grey background
export const CARD       = '#FFFFFF';
export const BORDER     = '#E5E8EC';
export const NAVY       = '#08244B';   // Midnight Navy — primary bg, nav, footer, hero (the premium colour)
export const NAVY_LIGHT = '#EAF0F6';
export const SLATE      = '#345A7D';   // Secondary — professional, corporate, charts
export const DEEP_CYAN  = '#00A9B8';   // Technology, innovation, hover states
export const ELECTRIC   = '#2F80ED';   // Analytics, data, AI
export const BLUE_MID   = DEEP_CYAN;

// ============ SHARED DATA ============
// New registrations Jan–Aug 2026: EV = fuel type 'Electric'. Sources: LTA M03 (cars),
// M04 (motorcycles), M08 (goods vehicles & buses), Aug 2026 editions.
export const newRegByType = [
  { type: 'Cars', segId: 'cars', ev: 23028, totalNew: 36646 },
  { type: 'Motorcycle', segId: 'motorcycle', ev: 57, totalNew: 8469 },
  { type: 'LGV', segId: 'lgv', ev: 912, totalNew: 1297 },
  { type: 'HGV', segId: 'hgv', ev: 839, totalNew: 2352 },
  { type: 'VHGV', segId: 'vhgv', ev: 32, totalNew: 1468 },
  { type: 'Bus', segId: 'bus', ev: 130, totalNew: 360 },
];

export const brandMonthly = [
  { brand: 'BYD',           jan: 1112, feb: 859, mar: 1102, apr: 1349, may: 1091, jun: 953, jul: 995, aug: 857, total:  8318, type: 'car' },
  { brand: 'Tesla',         jan: 413, feb: 485, mar: 617, apr: 168, may: 360, jun: 783, jul: 434, aug: 463, total:  3723, type: 'car' },
  { brand: 'Chery',         jan: 229, feb: 138, mar: 205, apr: 184, may: 243, jun: 191, jul: 171, aug: 161, total:  1522, type: 'car' },
  { brand: 'M.G.',          jan: 115, feb: 124, mar: 136, apr: 163, may: 203, jun: 223, jul: 233, aug: 222, total:  1419, type: 'car' },
  { brand: 'GAC',           jan: 41, feb: 117, mar: 222, apr: 208, may: 166, jun: 87, jul: 232, aug: 247, total:  1320, type: 'car' },
  { brand: 'Xpeng',         jan: 66, feb: 75, mar: 106, apr: 152, may: 161, jun: 181, jul: 169, aug: 154, total:  1064, type: 'car' },
  { brand: 'Zeekr',         jan: 77, feb: 90, mar: 102, apr: 156, may: 140, jun: 130, jul: 135, aug: 145, total:   975, type: 'car' },
  { brand: 'B.M.W.',        jan: 74, feb: 79, mar: 126, apr: 148, may: 120, jun: 115, jul: 62, aug: 66, total:   790, type: 'car' },
  { brand: 'Maxus',         jan: 15, feb: 14, mar: 30, apr: 51, may: 50, jun: 122, jul: 76, aug: 61, total:   419, type: 'car' },
  { brand: 'Dongfeng',      jan: 41, feb: 35, mar: 70, apr: 54, may: 30, jun: 72, jul: 76, aug: 32, total:   410, type: 'car' },
  { brand: 'Avatr',         jan: 11, feb: 26, mar: 41, apr: 45, may: 45, jun: 61, jul: 72, aug: 60, total:   361, type: 'car' },
  { brand: 'Mercedes-Benz', jan: 12, feb: 14, mar: 17, apr: 5, may: 8, jun: 60, jul: 141, aug: 103, total:   360, type: 'car' },
  { brand: 'Volvo',         jan: 22, feb: 37, mar: 31, apr: 40, may: 30, jun: 36, jul: 48, aug: 40, total:   284, type: 'car' },
  { brand: 'Deepal',        jan: 8, feb: 14, mar: 9, apr: 15, may: 18, jun: 81, jul: 67, aug: 43, total:   255, type: 'car' },
  { brand: 'Leapmotor',     jan: 19, feb: 15, mar: 16, apr: 42, may: 42, jun: 40, jul: 40, aug: 40, total:   254, type: 'car' },
  { brand: 'Toyota',        jan: 0, feb: 14, mar: 51, apr: 23, may: 57, jun: 43, jul: 30, aug: 27, total:   245, type: 'car' },
  { brand: 'Geely',         jan: 16, feb: 9, mar: 34, apr: 29, may: 30, jun: 33, jul: 38, aug: 28, total:   217, type: 'car' },
  { brand: 'Porsche',       jan: 7, feb: 26, mar: 33, apr: 16, may: 27, jun: 25, jul: 25, aug: 25, total:   184, type: 'car' },
  { brand: 'Hyundai',       jan: 13, feb: 13, mar: 11, apr: 14, may: 18, jun: 7, jul: 15, aug: 3, total:    94, type: 'car' },
  { brand: 'Mini',          jan: 12, feb: 9, mar: 13, apr: 16, may: 15, jun: 12, jul: 10, aug: 6, total:    93, type: 'car' },
  { brand: 'Audi',          jan: 11, feb: 8, mar: 14, apr: 21, may: 10, jun: 8, jul: 10, aug: 7, total:    89, type: 'car' },
  { brand: 'Kia',           jan: 4, feb: 3, mar: 4, apr: 11, may: 21, jun: 16, jul: 8, aug: 6, total:    73, type: 'car' },
  { brand: 'Opel',          jan: 0, feb: 2, mar: 49, apr: 8, may: 1, jun: 10, jul: 1, aug: 0, total:    71, type: 'car' },
  { brand: 'Great Wall',    jan: 4, feb: 2, mar: 6, apr: 4, may: 3, jun: 3, jul: 18, aug: 20, total:    60, type: 'car' },
  { brand: 'Mazda',         jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 35, aug: 19, total:    54, type: 'car' },
  { brand: 'Polestar',      jan: 5, feb: 8, mar: 11, apr: 12, may: 5, jun: 7, jul: 3, aug: 3, total:    54, type: 'car' },
  { brand: 'Smart',         jan: 2, feb: 4, mar: 2, apr: 7, may: 4, jun: 8, jul: 13, aug: 14, total:    54, type: 'car' },
  { brand: 'Subaru',        jan: 0, feb: 2, mar: 5, apr: 9, may: 11, jun: 4, jul: 8, aug: 5, total:    44, type: 'car' },
  { brand: 'NIO',           jan: 7, feb: 5, mar: 4, apr: 2, may: 6, jun: 5, jul: 5, aug: 6, total:    40, type: 'car' },
  { brand: 'Hongqi',        jan: 0, feb: 0, mar: 0, apr: 0, may: 1, jun: 17, jul: 12, aug: 8, total:    38, type: 'car' },
  { brand: 'Volkswagen',    jan: 4, feb: 5, mar: 4, apr: 7, may: 4, jun: 4, jul: 3, aug: 1, total:    32, type: 'car' },
  { brand: 'Cupra',         jan: 2, feb: 1, mar: 6, apr: 4, may: 2, jun: 4, jul: 4, aug: 0, total:    23, type: 'car' },
  { brand: 'Citroen',       jan: 3, feb: 0, mar: 1, apr: 16, may: 0, jun: 0, jul: 0, aug: 0, total:    20, type: 'car' },
  { brand: 'Nissan',        jan: 0, feb: 0, mar: 2, apr: 2, may: 6, jun: 3, jul: 1, aug: 1, total:    15, type: 'car' },
  { brand: 'Suzuki',        jan: 0, feb: 0, mar: 0, apr: 1, may: 0, jun: 5, jul: 4, aug: 2, total:    12, type: 'car' },
  { brand: 'EVeasy',        jan: 9, feb: 0, mar: 1, apr: 0, may: 0, jun: 1, jul: 0, aug: 0, total:    11, type: 'car' },
  { brand: 'Honda',         jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 4, jul: 1, aug: 3, total:     8, type: 'car' },
  { brand: 'Lotus',         jan: 0, feb: 2, mar: 0, apr: 0, may: 0, jun: 1, jul: 2, aug: 1, total:     6, type: 'car' },
  { brand: 'Skoda',         jan: 0, feb: 0, mar: 0, apr: 0, may: 2, jun: 0, jul: 3, aug: 1, total:     6, type: 'car' },
  { brand: 'Skyworth',      jan: 0, feb: 1, mar: 4, apr: 0, may: 0, jun: 1, jul: 0, aug: 0, total:     6, type: 'car' },
  { brand: 'KGM',           jan: 0, feb: 1, mar: 1, apr: 0, may: 0, jun: 1, jul: 0, aug: 0, total:     3, type: 'car' },
  { brand: 'Jaguar',        jan: 1, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total:     1, type: 'car' },
  { brand: 'Rolls-Royce',   jan: 0, feb: 0, mar: 1, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total:     1, type: 'car' },
];

export const commercialBrandMonthly = [
  { brand: 'BYD', jan: 22, feb: 44, mar: 103, apr: 65, may: 49, jun: 33, jul: 36, aug: 41, total: 393, lgv: 157, hgv: 195, vhgv: 1, bus: 40 },
  { brand: 'Maxus', jan: 41, feb: 9, mar: 21, apr: 41, may: 32, jun: 48, jul: 48, aug: 32, total: 272, lgv: 218, hgv: 47, vhgv: 0, bus: 7 },
  { brand: 'Toyota', jan: 27, feb: 12, mar: 17, apr: 20, may: 7, jun: 19, jul: 26, aug: 6, total: 134, lgv: 20, hgv: 114, vhgv: 0, bus: 0 },
  { brand: 'Foton', jan: 32, feb: 19, mar: 12, apr: 11, may: 12, jun: 15, jul: 12, aug: 12, total: 125, lgv: 26, hgv: 94, vhgv: 2, bus: 3 },
  { brand: 'Farizon', jan: 14, feb: 8, mar: 9, apr: 24, may: 11, jun: 15, jul: 27, aug: 8, total: 116, lgv: 59, hgv: 9, vhgv: 0, bus: 48 },
  { brand: 'Sany', jan: 19, feb: 7, mar: 3, apr: 7, may: 9, jun: 28, jul: 26, aug: 16, total: 115, lgv: 0, hgv: 104, vhgv: 11, bus: 0 },
  { brand: 'Citroen', jan: 19, feb: 4, mar: 13, apr: 7, may: 3, jun: 20, jul: 13, aug: 13, total: 92, lgv: 91, hgv: 0, vhgv: 0, bus: 1 },
  { brand: 'Forland', jan: 0, feb: 7, mar: 8, apr: 8, may: 28, jun: 12, jul: 17, aug: 6, total: 86, lgv: 3, hgv: 83, vhgv: 0, bus: 0 },
  { brand: 'Qingling', jan: 0, feb: 10, mar: 8, apr: 9, may: 25, jun: 11, jul: 4, aug: 4, total: 71, lgv: 0, hgv: 71, vhgv: 0, bus: 0 },
  { brand: 'Higer', jan: 5, feb: 11, mar: 18, apr: 10, may: 8, jun: 5, jul: 1, aug: 6, total: 64, lgv: 46, hgv: 11, vhgv: 0, bus: 7 },
  { brand: 'SRM', jan: 2, feb: 0, mar: 13, apr: 12, may: 9, jun: 5, jul: 9, aug: 8, total: 58, lgv: 24, hgv: 34, vhgv: 0, bus: 0 },
  { brand: 'Volkswagen', jan: 14, feb: 5, mar: 7, apr: 6, may: 8, jun: 5, jul: 4, aug: 8, total: 57, lgv: 57, hgv: 0, vhgv: 0, bus: 0 },
  { brand: 'JAC', jan: 5, feb: 4, mar: 17, apr: 1, may: 7, jun: 9, jul: 5, aug: 8, total: 56, lgv: 10, hgv: 46, vhgv: 0, bus: 0 },
  { brand: 'Mercedes-Benz', jan: 10, feb: 5, mar: 8, apr: 15, may: 8, jun: 1, jul: 0, aug: 4, total: 51, lgv: 34, hgv: 0, vhgv: 17, bus: 0 },
  { brand: 'Opel', jan: 0, feb: 2, mar: 5, apr: 8, may: 13, jun: 7, jul: 6, aug: 2, total: 43, lgv: 41, hgv: 0, vhgv: 0, bus: 2 },
  { brand: 'Sokon', jan: 0, feb: 0, mar: 1, apr: 24, may: 2, jun: 0, jul: 2, aug: 7, total: 36, lgv: 36, hgv: 0, vhgv: 0, bus: 0 },
  { brand: 'Joylong', jan: 5, feb: 0, mar: 1, apr: 2, may: 5, jun: 6, jul: 2, aug: 3, total: 24, lgv: 12, hgv: 0, vhgv: 0, bus: 12 },
  { brand: 'Shineray', jan: 0, feb: 4, mar: 11, apr: 1, may: 3, jun: 2, jul: 0, aug: 1, total: 22, lgv: 22, hgv: 0, vhgv: 0, bus: 0 },
  { brand: 'Chenglong', jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 1, jul: 6, aug: 5, total: 12, lgv: 0, hgv: 12, vhgv: 0, bus: 0 },
  { brand: 'DFSK', jan: 1, feb: 2, mar: 2, apr: 2, may: 1, jun: 0, jul: 1, aug: 3, total: 12, lgv: 12, hgv: 0, vhgv: 0, bus: 0 },
  { brand: 'KYC', jan: 3, feb: 1, mar: 2, apr: 1, may: 1, jun: 1, jul: 1, aug: 1, total: 11, lgv: 11, hgv: 0, vhgv: 0, bus: 0 },
  { brand: 'Nissan', jan: 0, feb: 0, mar: 3, apr: 1, may: 1, jun: 3, jul: 3, aug: 0, total: 11, lgv: 11, hgv: 0, vhgv: 0, bus: 0 },
  { brand: 'Linxys', jan: 1, feb: 0, mar: 1, apr: 3, may: 2, jun: 1, jul: 2, aug: 0, total: 10, lgv: 10, hgv: 0, vhgv: 0, bus: 0 },
  { brand: 'Piccolo', jan: 2, feb: 2, mar: 1, apr: 0, may: 1, jun: 1, jul: 0, aug: 1, total: 8, lgv: 8, hgv: 0, vhgv: 0, bus: 0 },
  { brand: 'Nichiyu', jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 7, aug: 0, total: 7, lgv: 0, hgv: 7, vhgv: 0, bus: 0 },
  { brand: 'Golden Dragon', jan: 0, feb: 0, mar: 1, apr: 2, may: 0, jun: 0, jul: 0, aug: 2, total: 5, lgv: 0, hgv: 0, vhgv: 0, bus: 5 },
  { brand: 'CRRC', jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 1, aug: 2, total: 3, lgv: 0, hgv: 0, vhgv: 0, bus: 3 },
  { brand: 'Still', jan: 0, feb: 1, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 2, total: 3, lgv: 0, hgv: 3, vhgv: 0, bus: 0 },
  { brand: 'Dongfeng', jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 1, jul: 0, aug: 1, total: 2, lgv: 0, hgv: 2, vhgv: 0, bus: 0 },
  { brand: 'Liugong', jan: 2, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total: 2, lgv: 0, hgv: 2, vhgv: 0, bus: 0 },
  { brand: 'Supersun', jan: 0, feb: 2, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total: 2, lgv: 0, hgv: 2, vhgv: 0, bus: 0 },
  { brand: 'Victory', jan: 0, feb: 0, mar: 0, apr: 0, may: 1, jun: 1, jul: 0, aug: 0, total: 2, lgv: 2, hgv: 0, vhgv: 0, bus: 0 },
  { brand: 'Guangtai', jan: 1, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total: 1, lgv: 0, hgv: 0, vhgv: 1, bus: 0 },
  { brand: 'Landking', jan: 0, feb: 0, mar: 0, apr: 1, may: 0, jun: 0, jul: 0, aug: 0, total: 1, lgv: 0, hgv: 1, vhgv: 0, bus: 0 },
  { brand: 'Microlift', jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 1, total: 1, lgv: 1, hgv: 0, vhgv: 0, bus: 0 },
  { brand: 'Renault', jan: 0, feb: 0, mar: 1, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total: 1, lgv: 1, hgv: 0, vhgv: 0, bus: 0 },
  { brand: 'Shangqi', jan: 0, feb: 0, mar: 0, apr: 1, may: 0, jun: 0, jul: 0, aug: 0, total: 1, lgv: 0, hgv: 1, vhgv: 0, bus: 0 },
  { brand: 'TLD', jan: 0, feb: 0, mar: 0, apr: 0, may: 1, jun: 0, jul: 0, aug: 0, total: 1, lgv: 0, hgv: 1, vhgv: 0, bus: 0 },
  { brand: 'Yutong', jan: 1, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total: 1, lgv: 0, hgv: 0, vhgv: 0, bus: 1 },
  { brand: 'Zhong Tong', jan: 0, feb: 1, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total: 1, lgv: 0, hgv: 0, vhgv: 0, bus: 1 },
];

// Per-segment monthly EV registrations (LTA M08), used by the LGV / HGV / VHGV / Bus tabs
// so each tab's months and totals count only that segment's vehicles.
export const commercialSegMonthly = {
  'BYD': { lgv: { jan: 21, feb: 16, mar: 42, apr: 26, may: 17, jun: 3, jul: 18, aug: 14, total: 157 }, hgv: { jan: 0, feb: 18, mar: 31, apr: 39, may: 32, jun: 30, jul: 18, aug: 27, total: 195 }, vhgv: { jan: 1, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total: 1 }, bus: { jan: 0, feb: 10, mar: 30, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total: 40 } },
  'Chenglong': { hgv: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 1, jul: 6, aug: 5, total: 12 } },
  'Citroen': { lgv: { jan: 19, feb: 4, mar: 13, apr: 7, may: 2, jun: 20, jul: 13, aug: 13, total: 91 }, bus: { jan: 0, feb: 0, mar: 0, apr: 0, may: 1, jun: 0, jul: 0, aug: 0, total: 1 } },
  'CRRC': { bus: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 1, aug: 2, total: 3 } },
  'DFSK': { lgv: { jan: 1, feb: 2, mar: 2, apr: 2, may: 1, jun: 0, jul: 1, aug: 3, total: 12 } },
  'Dongfeng': { hgv: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 1, jul: 0, aug: 1, total: 2 } },
  'Farizon': { lgv: { jan: 1, feb: 3, mar: 3, apr: 14, may: 11, jun: 11, jul: 10, aug: 6, total: 59 }, hgv: { jan: 3, feb: 1, mar: 0, apr: 2, may: 0, jun: 1, jul: 2, aug: 0, total: 9 }, bus: { jan: 10, feb: 4, mar: 6, apr: 8, may: 0, jun: 3, jul: 15, aug: 2, total: 48 } },
  'Forland': { lgv: { jan: 0, feb: 0, mar: 0, apr: 1, may: 0, jun: 1, jul: 1, aug: 0, total: 3 }, hgv: { jan: 0, feb: 7, mar: 8, apr: 7, may: 28, jun: 11, jul: 16, aug: 6, total: 83 } },
  'Foton': { lgv: { jan: 5, feb: 9, mar: 1, apr: 4, may: 3, jun: 3, jul: 0, aug: 1, total: 26 }, hgv: { jan: 27, feb: 9, mar: 10, apr: 7, may: 9, jun: 12, jul: 11, aug: 9, total: 94 }, vhgv: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 1, aug: 1, total: 2 }, bus: { jan: 0, feb: 1, mar: 1, apr: 0, may: 0, jun: 0, jul: 0, aug: 1, total: 3 } },
  'Golden Dragon': { bus: { jan: 0, feb: 0, mar: 1, apr: 2, may: 0, jun: 0, jul: 0, aug: 2, total: 5 } },
  'Higer': { lgv: { jan: 3, feb: 11, mar: 16, apr: 7, may: 7, jun: 2, jul: 0, aug: 0, total: 46 }, hgv: { jan: 0, feb: 0, mar: 2, apr: 2, may: 0, jun: 1, jul: 1, aug: 5, total: 11 }, bus: { jan: 2, feb: 0, mar: 0, apr: 1, may: 1, jun: 2, jul: 0, aug: 1, total: 7 } },
  'JAC': { lgv: { jan: 1, feb: 0, mar: 0, apr: 1, may: 3, jun: 5, jul: 0, aug: 0, total: 10 }, hgv: { jan: 4, feb: 4, mar: 17, apr: 0, may: 4, jun: 4, jul: 5, aug: 8, total: 46 } },
  'Joylong': { lgv: { jan: 5, feb: 0, mar: 0, apr: 0, may: 3, jun: 2, jul: 0, aug: 2, total: 12 }, bus: { jan: 0, feb: 0, mar: 1, apr: 2, may: 2, jun: 4, jul: 2, aug: 1, total: 12 } },
  'KYC': { lgv: { jan: 3, feb: 1, mar: 2, apr: 1, may: 1, jun: 1, jul: 1, aug: 1, total: 11 } },
  'Linxys': { lgv: { jan: 1, feb: 0, mar: 1, apr: 3, may: 2, jun: 1, jul: 2, aug: 0, total: 10 } },
  'Maxus': { lgv: { jan: 41, feb: 9, mar: 21, apr: 35, may: 21, jun: 36, jul: 33, aug: 22, total: 218 }, hgv: { jan: 0, feb: 0, mar: 0, apr: 6, may: 10, jun: 9, jul: 13, aug: 9, total: 47 }, bus: { jan: 0, feb: 0, mar: 0, apr: 0, may: 1, jun: 3, jul: 2, aug: 1, total: 7 } },
  'Mercedes-Benz': { lgv: { jan: 6, feb: 0, mar: 4, apr: 11, may: 8, jun: 1, jul: 0, aug: 4, total: 34 }, vhgv: { jan: 4, feb: 5, mar: 4, apr: 4, may: 0, jun: 0, jul: 0, aug: 0, total: 17 } },
  'Microlift': { lgv: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 1, total: 1 } },
  'Nichiyu': { hgv: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 7, aug: 0, total: 7 } },
  'Nissan': { lgv: { jan: 0, feb: 0, mar: 3, apr: 1, may: 1, jun: 3, jul: 3, aug: 0, total: 11 } },
  'Opel': { lgv: { jan: 0, feb: 2, mar: 4, apr: 7, may: 13, jun: 7, jul: 6, aug: 2, total: 41 }, bus: { jan: 0, feb: 0, mar: 1, apr: 1, may: 0, jun: 0, jul: 0, aug: 0, total: 2 } },
  'Piccolo': { lgv: { jan: 2, feb: 2, mar: 1, apr: 0, may: 1, jun: 1, jul: 0, aug: 1, total: 8 } },
  'Qingling': { hgv: { jan: 0, feb: 10, mar: 8, apr: 9, may: 25, jun: 11, jul: 4, aug: 4, total: 71 } },
  'Sany': { hgv: { jan: 17, feb: 6, mar: 3, apr: 6, may: 7, jun: 25, jul: 25, aug: 15, total: 104 }, vhgv: { jan: 2, feb: 1, mar: 0, apr: 1, may: 2, jun: 3, jul: 1, aug: 1, total: 11 } },
  'Shineray': { lgv: { jan: 0, feb: 4, mar: 11, apr: 1, may: 3, jun: 2, jul: 0, aug: 1, total: 22 } },
  'Sokon': { lgv: { jan: 0, feb: 0, mar: 1, apr: 24, may: 2, jun: 0, jul: 2, aug: 7, total: 36 } },
  'SRM': { lgv: { jan: 2, feb: 0, mar: 4, apr: 3, may: 5, jun: 0, jul: 9, aug: 1, total: 24 }, hgv: { jan: 0, feb: 0, mar: 9, apr: 9, may: 4, jun: 5, jul: 0, aug: 7, total: 34 } },
  'Still': { hgv: { jan: 0, feb: 1, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 2, total: 3 } },
  'Toyota': { lgv: { jan: 6, feb: 3, mar: 1, apr: 2, may: 2, jun: 0, jul: 5, aug: 1, total: 20 }, hgv: { jan: 21, feb: 9, mar: 16, apr: 18, may: 5, jun: 19, jul: 21, aug: 5, total: 114 } },
  'Volkswagen': { lgv: { jan: 14, feb: 5, mar: 7, apr: 6, may: 8, jun: 5, jul: 4, aug: 8, total: 57 } },
  'Guangtai': { vhgv: { jan: 1, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total: 1 } },
  'Landking': { hgv: { jan: 0, feb: 0, mar: 0, apr: 1, may: 0, jun: 0, jul: 0, aug: 0, total: 1 } },
  'Liugong': { hgv: { jan: 2, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total: 2 } },
  'Renault': { lgv: { jan: 0, feb: 0, mar: 1, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total: 1 } },
  'Shangqi': { hgv: { jan: 0, feb: 0, mar: 0, apr: 1, may: 0, jun: 0, jul: 0, aug: 0, total: 1 } },
  'Supersun': { hgv: { jan: 0, feb: 2, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total: 2 } },
  'TLD': { hgv: { jan: 0, feb: 0, mar: 0, apr: 0, may: 1, jun: 0, jul: 0, aug: 0, total: 1 } },
  'Victory': { lgv: { jan: 0, feb: 0, mar: 0, apr: 0, may: 1, jun: 1, jul: 0, aug: 0, total: 2 } },
  'Yutong': { bus: { jan: 1, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total: 1 } },
  'Zhong Tong': { bus: { jan: 0, feb: 1, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total: 1 } },
};

export const motorcycleBrandMonthly = [
  { brand: 'R.A.P.', jan: 0, feb: 2, mar: 4, apr: 1, may: 0, jun: 0, jul: 1, aug: 7, total: 15 },
  { brand: 'Gogoro', jan: 1, feb: 2, mar: 1, apr: 1, may: 0, jun: 1, jul: 1, aug: 1, total: 8 },
  { brand: 'Vectrix', jan: 0, feb: 2, mar: 1, apr: 2, may: 0, jun: 0, jul: 2, aug: 0, total: 7 },
  { brand: 'Voge', jan: 2, feb: 0, mar: 1, apr: 1, may: 2, jun: 0, jul: 1, aug: 0, total: 7 },
  { brand: 'Aidea', jan: 0, feb: 0, mar: 0, apr: 0, may: 2, jun: 1, jul: 2, aug: 0, total: 5 },
  { brand: 'Vmoto', jan: 0, feb: 0, mar: 0, apr: 0, may: 1, jun: 4, jul: 0, aug: 0, total: 5 },
  { brand: 'Dayi Motor', jan: 0, feb: 0, mar: 0, apr: 2, may: 0, jun: 0, jul: 0, aug: 0, total: 2 },
  { brand: 'FELQ', jan: 0, feb: 0, mar: 0, apr: 1, may: 0, jun: 1, jul: 0, aug: 0, total: 2 },
  { brand: 'Golden Lion', jan: 0, feb: 2, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total: 2 },
  { brand: 'B.M.W.', jan: 0, feb: 0, mar: 1, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, total: 1 },
  { brand: 'QJMotor', jan: 0, feb: 0, mar: 0, apr: 1, may: 0, jun: 0, jul: 0, aug: 0, total: 1 },
  { brand: 'Scorpio Electric', jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 1, aug: 0, total: 1 },
  { brand: 'Smartuk', jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 1, aug: 0, total: 1 },
];

// Helper: get brand list for a given vehicle-type segment (pure function, not a hook)
export const getSegmentBrands = (seg) => {
  if (seg === 'cars') return brandMonthly.map(b => ({ ...b, unit: b.total }));
  if (seg === 'motorcycle') return motorcycleBrandMonthly.map(b => ({ ...b, unit: b.total }));
  if (['lgv', 'hgv', 'vhgv', 'bus'].includes(seg)) {
    return commercialBrandMonthly.filter(b => b[seg] > 0)
      .map(b => ({ ...b, ...(commercialSegMonthly[b.brand]?.[seg] || {}), unit: b[seg] }))
      .sort((a, b) => b.unit - a.unit);
  }
  return [];
};

export const popMonthly = [
  { v: 'Cars',       m: 'Jan', bev:  51454, hybrid: 120125, phev:  2555, petrol: 470815, diesel:  13822, other:  68, total: 658839 },
  { v: 'Cars',       m: 'Feb', bev:  53688, hybrid: 121408, phev:  2627, petrol: 467281, diesel:  13626, other:  67, total: 658697 },
  { v: 'Cars',       m: 'Mar', bev:  56770, hybrid: 122840, phev:  2705, petrol: 462180, diesel:  13311, other:  67, total: 657873 },
  { v: 'Cars',       m: 'Apr', bev:  59735, hybrid: 123968, phev:  2799, petrol: 457081, diesel:  12986, other:  65, total: 656634 },
  { v: 'Cars',       m: 'May', bev:  62653, hybrid: 125078, phev:  2915, petrol: 451351, diesel:  12631, other:  63, total: 654691 },
  { v: 'Cars',       m: 'Jun', bev:  66005, hybrid: 126044, phev:  3041, petrol: 446024, diesel:  12267, other:  61, total: 653442 },
  { v: 'Cars',       m: 'Jul', bev:  69190, hybrid: 127128, phev:  3195, petrol: 441350, diesel:  11907, other:  60, total: 652830 },
  { v: 'Cars',       m: 'Aug', bev:  72067, hybrid: 128041, phev:  3483, petrol: 436777, diesel:  11591, other:  60, total: 652019 },
  { v: 'Taxis',      m: 'Jan', bev:    552, hybrid:  11540, phev:     0, petrol:      3, diesel:     83, other:   0, total:  12178 },
  { v: 'Taxis',      m: 'Feb', bev:    557, hybrid:  11552, phev:     0, petrol:      3, diesel:     83, other:   0, total:  12195 },
  { v: 'Taxis',      m: 'Mar', bev:    569, hybrid:  11586, phev:     0, petrol:      3, diesel:     81, other:   0, total:  12239 },
  { v: 'Taxis',      m: 'Apr', bev:    586, hybrid:  11610, phev:     0, petrol:      3, diesel:     81, other:   0, total:  12280 },
  { v: 'Taxis',      m: 'May', bev:    599, hybrid:  11594, phev:     0, petrol:      3, diesel:     80, other:   0, total:  12276 },
  { v: 'Taxis',      m: 'Jun', bev:    620, hybrid:  11525, phev:     0, petrol:      3, diesel:     80, other:   0, total:  12228 },
  { v: 'Taxis',      m: 'Jul', bev:    633, hybrid:  11431, phev:     0, petrol:      2, diesel:     68, other:   0, total:  12134 },
  { v: 'Taxis',      m: 'Aug', bev:    642, hybrid:  11245, phev:     0, petrol:      2, diesel:     43, other:   0, total:  11932 },
  { v: 'Motorcycles', m: 'Jan', bev:    391, hybrid:      0, phev:     0, petrol: 151412, diesel:      0, other:   0, total: 151803 },
  { v: 'Motorcycles', m: 'Feb', bev:    398, hybrid:      0, phev:     0, petrol: 151736, diesel:      0, other:   0, total: 152134 },
  { v: 'Motorcycles', m: 'Mar', bev:    406, hybrid:      0, phev:     0, petrol: 152364, diesel:      0, other:   0, total: 152770 },
  { v: 'Motorcycles', m: 'Apr', bev:    415, hybrid:      0, phev:     0, petrol: 152697, diesel:      0, other:   0, total: 153112 },
  { v: 'Motorcycles', m: 'May', bev:    420, hybrid:      0, phev:     0, petrol: 153122, diesel:      0, other:   0, total: 153542 },
  { v: 'Motorcycles', m: 'Jun', bev:    426, hybrid:      0, phev:     0, petrol: 153549, diesel:      0, other:   0, total: 153975 },
  { v: 'Motorcycles', m: 'Jul', bev:    433, hybrid:      0, phev:     0, petrol: 153973, diesel:      0, other:   0, total: 154406 },
  { v: 'Motorcycles', m: 'Aug', bev:    440, hybrid:      0, phev:     0, petrol: 154143, diesel:      0, other:   0, total: 154583 },
  { v: 'Goods',      m: 'Jan', bev:   6575, hybrid:     39, phev:     1, petrol:  13707, diesel: 122438, other:   0, total: 142760 },
  { v: 'Goods',      m: 'Feb', bev:   6706, hybrid:     39, phev:     2, petrol:  13732, diesel: 122255, other:   0, total: 142734 },
  { v: 'Goods',      m: 'Mar', bev:   6936, hybrid:     39, phev:     2, petrol:  13754, diesel: 122229, other:   0, total: 142960 },
  { v: 'Goods',      m: 'Apr', bev:   7192, hybrid:     39, phev:     2, petrol:  13771, diesel: 122038, other:   0, total: 143042 },
  { v: 'Goods',      m: 'May', bev:   7428, hybrid:     39, phev:     2, petrol:  13790, diesel: 121801, other:   0, total: 143060 },
  { v: 'Goods',      m: 'Jun', bev:   7649, hybrid:     39, phev:     2, petrol:  13791, diesel: 121411, other:   0, total: 142892 },
  { v: 'Goods',      m: 'Jul', bev:   7857, hybrid:     39, phev:     2, petrol:  13776, diesel: 120898, other:   0, total: 142572 },
  { v: 'Goods',      m: 'Aug', bev:   8043, hybrid:     39, phev:     2, petrol:  13769, diesel: 120450, other:   0, total: 142303 },
  { v: 'Buses',      m: 'Jan', bev:    813, hybrid:     50, phev:    45, petrol:    133, diesel:  17323, other:   0, total:  18364 },
  { v: 'Buses',      m: 'Feb', bev:    830, hybrid:     50, phev:    44, petrol:    133, diesel:  17314, other:   0, total:  18371 },
  { v: 'Buses',      m: 'Mar', bev:    870, hybrid:     50, phev:    45, petrol:    132, diesel:  17292, other:   0, total:  18389 },
  { v: 'Buses',      m: 'Apr', bev:    885, hybrid:     50, phev:    45, petrol:    132, diesel:  17291, other:   0, total:  18403 },
  { v: 'Buses',      m: 'May', bev:    890, hybrid:     50, phev:    46, petrol:    131, diesel:  17267, other:   0, total:  18384 },
  { v: 'Buses',      m: 'Jun', bev:    900, hybrid:     50, phev:    46, petrol:    131, diesel:  17221, other:   0, total:  18348 },
  { v: 'Buses',      m: 'Jul', bev:    920, hybrid:     50, phev:    46, petrol:    132, diesel:  17183, other:   0, total:  18331 },
  { v: 'Buses',      m: 'Aug', bev:    930, hybrid:     50, phev:    46, petrol:    132, diesel:  17126, other:   0, total:  18284 },
];

export const popAnnual = [
  { v: 'Cars',       y: 2015, bev:      1, hybrid:   6394, phev:   108, petrol: 587900, diesel:   5976, other: 1932, total: 602311 },
  { v: 'Cars',       y: 2016, bev:     12, hybrid:  10097, phev:   125, petrol: 578977, diesel:  10364, other: 1682, total: 601257 },
  { v: 'Cars',       y: 2017, bev:    314, hybrid:  20773, phev:   206, petrol: 574443, diesel:  15514, other: 1006, total: 612256 },
  { v: 'Cars',       y: 2018, bev:    560, hybrid:  27200, phev:   380, petrol: 569673, diesel:  17253, other:  386, total: 615452 },
  { v: 'Cars',       y: 2019, bev:   1120, hybrid:  35737, phev:   473, petrol: 574967, diesel:  18049, other:  250, total: 630596 },
  { v: 'Cars',       y: 2020, bev:   1217, hybrid:  41863, phev:   552, petrol: 572132, diesel:  18076, other:  202, total: 634042 },
  { v: 'Cars',       y: 2021, bev:   2942, hybrid:  54840, phev:   692, petrol: 568376, diesel:  18136, other:  164, total: 645150 },
  { v: 'Cars',       y: 2022, bev:   6531, hybrid:  65901, phev:  1102, petrol: 558729, diesel:  18261, other:  143, total: 650667 },
  { v: 'Cars',       y: 2023, bev:  11941, hybrid:  79274, phev:  1360, petrol: 540605, diesel:  18037, other:   85, total: 651302 },
  { v: 'Cars',       y: 2024, bev:  26225, hybrid:  99170, phev:  1557, petrol: 513943, diesel:  16775, other:   74, total: 657744 },
  { v: 'Cars',       y: 2025, bev:  49110, hybrid: 118705, phev:  2450, petrol: 475455, diesel:  14101, other:   68, total: 659889 },
  { v: 'Cars',       y: 2026, bev:  72067, hybrid: 128041, phev:  3483, petrol: 436777, diesel:  11591, other:   60, total: 652019 },
  { v: 'Taxis',      y: 2015, bev:      0, hybrid:   1889, phev:     0, petrol:    466, diesel:  24244, other: 1660, total:  28259 },
  { v: 'Taxis',      y: 2016, bev:      0, hybrid:   2492, phev:     0, petrol:    260, diesel:  23748, other: 1034, total:  27534 },
  { v: 'Taxis',      y: 2017, bev:      0, hybrid:   4159, phev:     0, petrol:    129, diesel:  18851, other:    1, total:  23140 },
  { v: 'Taxis',      y: 2018, bev:    102, hybrid:   5337, phev:     0, petrol:     53, diesel:  15089, other:    0, total:  20581 },
  { v: 'Taxis',      y: 2019, bev:    133, hybrid:   8626, phev:     0, petrol:     24, diesel:   9759, other:    0, total:  18542 },
  { v: 'Taxis',      y: 2020, bev:     32, hybrid:   9117, phev:     0, petrol:     21, diesel:   6508, other:    0, total:  15678 },
  { v: 'Taxis',      y: 2021, bev:    304, hybrid:   9617, phev:     0, petrol:     15, diesel:   4951, other:    0, total:  14887 },
  { v: 'Taxis',      y: 2022, bev:    402, hybrid:   9661, phev:     0, petrol:      9, diesel:   4012, other:    0, total:  14084 },
  { v: 'Taxis',      y: 2023, bev:    471, hybrid:  10284, phev:     0, petrol:      5, diesel:   2860, other:    0, total:  13620 },
  { v: 'Taxis',      y: 2024, bev:    502, hybrid:  11348, phev:     0, petrol:      4, diesel:   1263, other:    0, total:  13117 },
  { v: 'Taxis',      y: 2025, bev:    527, hybrid:  11547, phev:     0, petrol:      3, diesel:     84, other:    0, total:  12161 },
  { v: 'Taxis',      y: 2026, bev:    642, hybrid:  11245, phev:     0, petrol:      2, diesel:     43, other:    0, total:  11932 },
  { v: 'Motorcycles', y: 2015, bev:      2, hybrid:      0, phev:     0, petrol: 143277, diesel:      0, other:    0, total: 143279 },
  { v: 'Motorcycles', y: 2016, bev:      2, hybrid:      0, phev:     0, petrol: 142437, diesel:      0, other:    0, total: 142439 },
  { v: 'Motorcycles', y: 2017, bev:      2, hybrid:      0, phev:     0, petrol: 141302, diesel:      0, other:    0, total: 141304 },
  { v: 'Motorcycles', y: 2018, bev:      2, hybrid:      0, phev:     0, petrol: 136840, diesel:      0, other:    0, total: 136842 },
  { v: 'Motorcycles', y: 2019, bev:      2, hybrid:      0, phev:     0, petrol: 140396, diesel:      0, other:    0, total: 140398 },
  { v: 'Motorcycles', y: 2020, bev:      1, hybrid:      0, phev:     0, petrol: 140781, diesel:      0, other:    0, total: 140782 },
  { v: 'Motorcycles', y: 2021, bev:      5, hybrid:      0, phev:     0, petrol: 141589, diesel:      0, other:    0, total: 141594 },
  { v: 'Motorcycles', y: 2022, bev:    115, hybrid:      0, phev:     0, petrol: 142338, diesel:      0, other:    0, total: 142453 },
  { v: 'Motorcycles', y: 2023, bev:    270, hybrid:      0, phev:     0, petrol: 143218, diesel:      0, other:    0, total: 143488 },
  { v: 'Motorcycles', y: 2024, bev:    304, hybrid:      0, phev:     0, petrol: 147091, diesel:      0, other:    0, total: 147395 },
  { v: 'Motorcycles', y: 2025, bev:    388, hybrid:      0, phev:     0, petrol: 151228, diesel:      0, other:    0, total: 151616 },
  { v: 'Motorcycles', y: 2026, bev:    440, hybrid:      0, phev:     0, petrol: 154143, diesel:      0, other:    0, total: 154583 },
  { v: 'Goods',      y: 2015, bev:      1, hybrid:      7, phev:     0, petrol:   7266, diesel: 136686, other:   12, total: 143972 },
  { v: 'Goods',      y: 2016, bev:     18, hybrid:      8, phev:     0, petrol:   7123, diesel: 136809, other:    8, total: 143966 },
  { v: 'Goods',      y: 2017, bev:     31, hybrid:      8, phev:     0, petrol:   5009, diesel: 137803, other:    6, total: 142857 },
  { v: 'Goods',      y: 2018, bev:     39, hybrid:      8, phev:     0, petrol:   4879, diesel: 136478, other:    4, total: 141408 },
  { v: 'Goods',      y: 2019, bev:     71, hybrid:      8, phev:     0, petrol:   5109, diesel: 135773, other:    3, total: 140964 },
  { v: 'Goods',      y: 2020, bev:     97, hybrid:      8, phev:     0, petrol:   5816, diesel: 134860, other:    2, total: 140783 },
  { v: 'Goods',      y: 2021, bev:    387, hybrid:     13, phev:     0, petrol:   9096, diesel: 134527, other:    1, total: 144024 },
  { v: 'Goods',      y: 2022, bev:   1894, hybrid:     19, phev:     0, petrol:  11447, diesel: 131623, other:    1, total: 144984 },
  { v: 'Goods',      y: 2023, bev:   3338, hybrid:     28, phev:     0, petrol:  12213, diesel: 128381, other:    0, total: 143960 },
  { v: 'Goods',      y: 2024, bev:   4567, hybrid:     33, phev:     1, petrol:  13059, diesel: 125549, other:    0, total: 143209 },
  { v: 'Goods',      y: 2025, bev:   6389, hybrid:     39, phev:     1, petrol:  13691, diesel: 122576, other:    0, total: 142696 },
  { v: 'Goods',      y: 2026, bev:   8043, hybrid:     39, phev:     2, petrol:  13769, diesel: 120450, other:    0, total: 142303 },
  { v: 'Buses',      y: 2015, bev:      0, hybrid:      4, phev:     0, petrol:     93, diesel:  17629, other:   14, total:  17740 },
  { v: 'Buses',      y: 2016, bev:      1, hybrid:      3, phev:     0, petrol:     73, diesel:  18247, other:   14, total:  18338 },
  { v: 'Buses',      y: 2017, bev:      2, hybrid:      3, phev:     0, petrol:     43, diesel:  18753, other:   13, total:  18814 },
  { v: 'Buses',      y: 2018, bev:      4, hybrid:     23, phev:     0, petrol:     33, diesel:  18875, other:   12, total:  18947 },
  { v: 'Buses',      y: 2019, bev:     10, hybrid:     50, phev:     0, petrol:     18, diesel:  19248, other:    0, total:  19326 },
  { v: 'Buses',      y: 2020, bev:     50, hybrid:     50, phev:     0, petrol:     14, diesel:  18798, other:    0, total:  18912 },
  { v: 'Buses',      y: 2021, bev:     75, hybrid:     50, phev:     0, petrol:     42, diesel:  18353, other:    0, total:  18520 },
  { v: 'Buses',      y: 2022, bev:    151, hybrid:     50, phev:     0, petrol:     97, diesel:  17538, other:    0, total:  17836 },
  { v: 'Buses',      y: 2023, bev:    242, hybrid:     50, phev:     0, petrol:    135, diesel:  17406, other:    0, total:  17833 },
  { v: 'Buses',      y: 2024, bev:    382, hybrid:     50, phev:    24, petrol:    132, diesel:  17680, other:    0, total:  18268 },
  { v: 'Buses',      y: 2025, bev:    799, hybrid:     50, phev:    44, petrol:    133, diesel:  17331, other:    0, total:  18357 },
  { v: 'Buses',      y: 2026, bev:    930, hybrid:     50, phev:    46, petrol:    132, diesel:  17126, other:    0, total:  18284 },
];

// ============ SHARED COMPONENTS ============
export const GoogleTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}>
      {label && <p style={{ color: SECONDARY, fontSize: 12, marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || INK, fontSize: 13, fontWeight: 500 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

export const MetricCard = ({ label, value, delta, sub, color = BLUE, bg, icon }) => (
  <div style={{ background: CARD, borderRadius: 12, padding: '22px 24px', border: `1px solid ${BORDER}`, borderLeft: `3px solid ${color}`, transition: 'border-color 0.2s' }}
    onMouseEnter={e => e.currentTarget.style.borderColor = color}
    onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.borderLeftColor = color; }}
  >
    <div style={{ fontSize: 12, color: SECONDARY, fontWeight: 600, marginBottom: 10, letterSpacing: 0.3, textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: 34, fontWeight: 700, color: INK, lineHeight: 1.1, letterSpacing: -0.5, fontFamily: "'Google Sans Flex', 'Inter', sans-serif" }}>{value}</div>
    {delta && <div style={{ fontSize: 13, fontWeight: 600, color: color, marginTop: 8 }}>{delta}</div>}
    {sub && <div style={{ fontSize: 12, color: SECONDARY, marginTop: 4 }}>{sub}</div>}
  </div>
);

// Collapsed-by-default methodology/source notes, expanded on click.
// Mirrors the "chevron to reveal notes" pattern used on IEA's report pages —
// keeps the chart itself clean while still making the full footnote available.
export const ChartNotes = ({ children, label = 'Notes & sources', style, padX = 20, bleed = 0 }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: `1px solid ${BORDER}`, marginLeft: -bleed, marginRight: -bleed, ...style }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: `10px ${padX}px`,
          background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
          fontSize: 12, fontWeight: 600, color: SECONDARY,
        }}
      >
        <span style={{ display: 'inline-block', transition: 'transform 0.15s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', fontSize: 10 }}>▶</span>
        {label}
      </button>
      {open && (
        <div style={{ padding: `0 ${padX}px 14px`, fontSize: 12, color: SECONDARY, lineHeight: 1.6 }}>
          {children}
        </div>
      )}
    </div>
  );
};
