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
export const newRegByType = [
  { type: 'Cars', segId: 'cars', ev: 20148, totalNew: 32097 },
  { type: 'Motorcycle', segId: 'motorcycle', ev: 49, totalNew: 7547 },
  { type: 'LGV', segId: 'lgv', ev: 788, totalNew: 1189 },
  { type: 'HGV', segId: 'hgv', ev: 602, totalNew: 2111 },
  { type: 'VHGV', segId: 'vhgv', ev: 0, totalNew: 1295 },
  { type: 'Bus', segId: 'bus', ev: 175, totalNew: 319 },
];

export const brandMonthly = [
  { brand: 'BYD',           jan: 1112, feb: 859, mar: 1102, apr: 1349, may: 1091, jun: 953, jul: 995, total:  7461, type: 'car' },
  { brand: 'Tesla',         jan: 413, feb: 485, mar: 617, apr: 168, may: 360, jun: 783, jul: 434, total:  3260, type: 'car' },
  { brand: 'Chery',         jan: 229, feb: 138, mar: 205, apr: 184, may: 243, jun: 191, jul: 171, total:  1361, type: 'car' },
  { brand: 'M.G.',          jan: 115, feb: 124, mar: 136, apr: 163, may: 203, jun: 223, jul: 233, total:  1197, type: 'car' },
  { brand: 'GAC',           jan: 41, feb: 117, mar: 222, apr: 208, may: 166, jun: 87, jul: 232, total:  1073, type: 'car' },
  { brand: 'Xpeng',         jan: 66, feb: 75, mar: 106, apr: 152, may: 161, jun: 181, jul: 169, total:   910, type: 'car' },
  { brand: 'Zeekr',         jan: 77, feb: 90, mar: 102, apr: 156, may: 140, jun: 130, jul: 135, total:   830, type: 'car' },
  { brand: 'B.M.W.',        jan: 74, feb: 79, mar: 126, apr: 148, may: 120, jun: 115, jul: 62, total:   724, type: 'car' },
  { brand: 'Dongfeng',      jan: 41, feb: 35, mar: 70, apr: 54, may: 30, jun: 72, jul: 76, total:   378, type: 'car' },
  { brand: 'Maxus',         jan: 15, feb: 14, mar: 30, apr: 51, may: 50, jun: 122, jul: 76, total:   358, type: 'car' },
  { brand: 'Avatr',         jan: 11, feb: 26, mar: 41, apr: 45, may: 45, jun: 61, jul: 72, total:   301, type: 'car' },
  { brand: 'Mercedes-Benz', jan: 12, feb: 14, mar: 17, apr: 5, may: 8, jun: 60, jul: 141, total:   257, type: 'car' },
  { brand: 'Volvo',         jan: 22, feb: 37, mar: 31, apr: 40, may: 30, jun: 36, jul: 48, total:   244, type: 'car' },
  { brand: 'Toyota',        jan: 0, feb: 14, mar: 51, apr: 23, may: 57, jun: 43, jul: 30, total:   218, type: 'car' },
  { brand: 'Leapmotor',     jan: 19, feb: 15, mar: 16, apr: 42, may: 42, jun: 40, jul: 40, total:   214, type: 'car' },
  { brand: 'Deepal',        jan: 8, feb: 14, mar: 9, apr: 15, may: 18, jun: 81, jul: 67, total:   212, type: 'car' },
  { brand: 'Geely',         jan: 16, feb: 9, mar: 34, apr: 29, may: 30, jun: 33, jul: 38, total:   189, type: 'car' },
  { brand: 'Porsche',       jan: 7, feb: 26, mar: 33, apr: 16, may: 27, jun: 25, jul: 25, total:   159, type: 'car' },
  { brand: 'Hyundai',       jan: 13, feb: 13, mar: 11, apr: 14, may: 18, jun: 7, jul: 15, total:    91, type: 'car' },
  { brand: 'Mini',          jan: 12, feb: 9, mar: 13, apr: 16, may: 15, jun: 12, jul: 10, total:    87, type: 'car' },
  { brand: 'Audi',          jan: 11, feb: 8, mar: 14, apr: 21, may: 10, jun: 8, jul: 10, total:    82, type: 'car' },
  { brand: 'Opel',          jan: 0, feb: 2, mar: 49, apr: 8, may: 1, jun: 10, jul: 1, total:    71, type: 'car' },
  { brand: 'Kia',           jan: 4, feb: 3, mar: 4, apr: 11, may: 21, jun: 16, jul: 8, total:    67, type: 'car' },
  { brand: 'Polestar',      jan: 5, feb: 8, mar: 11, apr: 12, may: 5, jun: 7, jul: 3, total:    51, type: 'car' },
  { brand: 'Great Wall',    jan: 4, feb: 2, mar: 6, apr: 4, may: 3, jun: 3, jul: 18, total:    40, type: 'car' },
  { brand: 'Smart',         jan: 2, feb: 4, mar: 2, apr: 7, may: 4, jun: 8, jul: 13, total:    40, type: 'car' },
  { brand: 'Subaru',        jan: 0, feb: 2, mar: 5, apr: 9, may: 11, jun: 4, jul: 8, total:    39, type: 'car' },
  { brand: 'Mazda',         jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 35, total:    35, type: 'car' },
  { brand: 'NIO',           jan: 7, feb: 5, mar: 4, apr: 2, may: 6, jun: 5, jul: 5, total:    34, type: 'car' },
  { brand: 'Volkswagen',    jan: 4, feb: 5, mar: 4, apr: 7, may: 4, jun: 4, jul: 3, total:    31, type: 'car' },
  { brand: 'Hongqi',        jan: 0, feb: 0, mar: 0, apr: 0, may: 1, jun: 17, jul: 12, total:    30, type: 'car' },
  { brand: 'Cupra',         jan: 2, feb: 1, mar: 6, apr: 4, may: 2, jun: 4, jul: 4, total:    23, type: 'car' },
  { brand: 'Citroen',       jan: 3, feb: 0, mar: 1, apr: 16, may: 0, jun: 0, jul: 0, total:    20, type: 'car' },
  { brand: 'Nissan',        jan: 0, feb: 0, mar: 2, apr: 2, may: 6, jun: 3, jul: 1, total:    14, type: 'car' },
  { brand: 'EVeasy',        jan: 9, feb: 0, mar: 1, apr: 0, may: 0, jun: 1, jul: 0, total:    11, type: 'car' },
  { brand: 'Suzuki',        jan: 0, feb: 0, mar: 0, apr: 1, may: 0, jun: 5, jul: 4, total:    10, type: 'car' },
  { brand: 'Skyworth',      jan: 0, feb: 1, mar: 4, apr: 0, may: 0, jun: 1, jul: 0, total:     6, type: 'car' },
  { brand: 'Honda',         jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 4, jul: 1, total:     5, type: 'car' },
  { brand: 'Lotus',         jan: 0, feb: 2, mar: 0, apr: 0, may: 0, jun: 1, jul: 2, total:     5, type: 'car' },
  { brand: 'Skoda',         jan: 0, feb: 0, mar: 0, apr: 0, may: 2, jun: 0, jul: 3, total:     5, type: 'car' },
  { brand: 'KGM',           jan: 0, feb: 1, mar: 1, apr: 0, may: 0, jun: 1, jul: 0, total:     3, type: 'car' },
  { brand: 'Jaguar',        jan: 1, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, total:     1, type: 'car' },
  { brand: 'Rolls-Royce',   jan: 0, feb: 0, mar: 1, apr: 0, may: 0, jun: 0, jul: 0, total:     1, type: 'car' },
];

export const commercialBrandMonthly = [
  { brand: 'BYD', jan: 22, feb: 44, mar: 103, apr: 65, may: 49, jun: 33, jul: 36, total: 352, lgv: 154, hgv: 135, bus: 63 },
  { brand: 'Maxus', jan: 41, feb: 9, mar: 21, apr: 41, may: 33, jun: 50, jul: 48, total: 243, lgv: 204, hgv: 37, bus: 1 },
  { brand: 'Foton', jan: 32, feb: 9, mar: 12, apr: 11, may: 12, jun: 15, jul: 12, total: 103, lgv: 47, hgv: 62, bus: 12 },
  { brand: 'Toyota', jan: 27, feb: 12, mar: 17, apr: 20, may: 7, jun: 19, jul: 26, total: 128, lgv: 22, hgv: 106, bus: 0 },
  { brand: 'Farizon', jan: 14, feb: 8, mar: 9, apr: 24, may: 11, jun: 15, jul: 27, total: 108, lgv: 55, hgv: 31, bus: 29 },
  { brand: 'Higer', jan: 5, feb: 11, mar: 18, apr: 10, may: 8, jun: 5, jul: 1, total: 58, lgv: 0, hgv: 8, bus: 48 },
  { brand: 'Qingling', jan: 10, feb: 8, mar: 9, apr: 0, may: 25, jun: 11, jul: 4, total: 67, lgv: 0, hgv: 67, bus: 0 },
  { brand: 'Forland', jan: 7, feb: 8, mar: 8, apr: 28, may: 0, jun: 12, jul: 17, total: 80, lgv: 55, hgv: 25, bus: 0 },
  { brand: 'Mercedes', jan: 10, feb: 5, mar: 8, apr: 15, may: 8, jun: 1, jul: 0, total: 47, lgv: 35, hgv: 4, bus: 0 },
  { brand: 'Citroen', jan: 19, feb: 4, mar: 13, apr: 7, may: 3, jun: 20, jul: 13, total: 79, lgv: 78, hgv: 1, bus: 0 },
  { brand: 'Sany', jan: 19, feb: 7, mar: 6, apr: 7, may: 9, jun: 28, jul: 26, total: 102, lgv: 0, hgv: 80, bus: 22 },
  { brand: 'Volkswagen', jan: 14, feb: 5, mar: 7, apr: 6, may: 8, jun: 5, jul: 4, total: 49, lgv: 49, hgv: 0, bus: 0 },
  { brand: 'SRM', jan: 4, feb: 13, mar: 12, apr: 9, may: 0, jun: 5, jul: 9, total: 52, lgv: 37, hgv: 10, bus: 0 },
  { brand: 'JAC', jan: 5, feb: 4, mar: 17, apr: 4, may: 7, jun: 9, jul: 5, total: 51, lgv: 11, hgv: 36, bus: 0 },
  { brand: 'Opel', jan: 2, feb: 5, mar: 8, apr: 13, may: 0, jun: 7, jul: 6, total: 41, lgv: 41, hgv: 0, bus: 0 },
];

// Helper: get brand list for a given vehicle-type segment (pure function, not a hook)
export const getSegmentBrands = (seg) => {
  if (seg === 'cars') return brandMonthly.map(b => ({ ...b, unit: b.total }));
  if (seg === 'lgv') return commercialBrandMonthly.filter(b => b.lgv > 0).map(b => ({ ...b, unit: b.lgv })).sort((a,b) => b.unit - a.unit);
  if (seg === 'hgv') return commercialBrandMonthly.filter(b => b.hgv > 0).map(b => ({ ...b, unit: b.hgv })).sort((a,b) => b.unit - a.unit);
  if (seg === 'bus') return commercialBrandMonthly.filter(b => b.bus > 0).map(b => ({ ...b, unit: b.bus })).sort((a,b) => b.unit - a.unit);
  return []; // motorcycle, gpv, vhgv — LTA does not publish brand-level breakdown
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
