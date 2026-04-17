import type { Restaurant } from '../types';

export const RESTAURANTS: Restaurant[] = [
  {
    id: "r_1",
    name: "솔향기",
    category: "한식",
    isBlueRibbon: false,
    lat: 37.5130,
    lng: 127.0625,
    weatherTags: ['any'],
    menus: [
      { name: "한식뷔페", price: 10000 }
    ]
  },
  {
    id: "r_2",
    name: "노이 봉은사 삼성본점",
    category: "양식",
    isBlueRibbon: false,
    lat: 37.5139,
    lng: 127.0620,
    weatherTags: ['any', 'rain', 'cold'],
    menus: [
      { name: "소고기쌀국수s", price: 12000 }
    ]
  },
  {
    id: "r_3",
    name: "천미향",
    category: "중식",
    isBlueRibbon: false,
    lat: 37.5126,
    lng: 127.0632,
    weatherTags: ['any', 'rain'],
    menus: [
      { name: "새우볶음밥", price: 10000 },
      { name: "삼선간짜장", price: 9000 },
      { name: "해물쟁반짜장", price: 10000 },
      { name: "짬짜면", price: 10000 },
      { name: "게살볶음밥", price: 12000 },
      { name: "잡채밥", price: 11000 }
    ]
  },
  {
    id: "r_4",
    name: "본가신의주찹쌀순대",
    category: "한식",
    isBlueRibbon: false,
    lat: 37.5139,
    lng: 127.0614,
    weatherTags: ['rain', 'cold', 'any'],
    menus: [
      { name: "순대국밥", price: 13000 }
    ]
  },
  {
    id: "r_5",
    name: "현대옥 코엑스점",
    category: "한식",
    isBlueRibbon: false,
    lat: 37.5120,
    lng: 127.0590,
    weatherTags: ['rain', 'cold', 'any'],
    menus: [
      { name: "전주남부식콩나물국밥", price: 9000 }
    ]
  },
  {
    id: "r_6",
    name: "써브웨이 봉은사역점",
    category: "양식",
    isBlueRibbon: false,
    lat: 37.5144,
    lng: 127.0601,
    weatherTags: ['any', 'hot'],
    menus: [
      { name: "에그마요(15cm세트)", price: 10300 }
    ]
  },
  {
    id: "r_7",
    name: "류창희국수 삼성점",
    category: "한식",
    isBlueRibbon: false,
    lat: 37.5139,
    lng: 127.0617,
    weatherTags: ['rain', 'cold', 'any'],
    menus: [
      { name: "오사리멸치수제비", price: 10500 },
      { name: "오사리멸치칼국수", price: 10500 },
      { name: "강원도햇살보리밥", price: 10500 }
    ]
  },
  {
    id: "r_8",
    name: "자연의원죽",
    category: "한식",
    isBlueRibbon: false,
    lat: 37.5139,
    lng: 127.0616,
    weatherTags: ['any', 'cold'],
    menus: [
      { name: "야채죽", price: 10000 },
      { name: "한우사태떡만두국", price: 10000 },
      { name: "야채떡라면", price: 6000 },
      { name: "참치야채볶음밥", price: 11000 },
      { name: "해물김치볶음밥", price: 11000 }
    ]
  },
  {
    id: "r_9",
    name: "사시미랑초밥",
    category: "한식",
    isBlueRibbon: false,
    lat: 37.5138,
    lng: 127.0616,
    weatherTags: ['any', 'hot'],
    menus: [
        { name: "회덮밥", price: 10000 },
        { name: "알밥", price: 10000 },
        { name: "낙지볶음", price: 13000 },
        { name: "알탕", price: 15000 },
        { name: "동태탕", price: 12000 }
    ]
  },
  {
    id: "r_10",
    name: "차이린",
    category: "중식",
    isBlueRibbon: false,
    lat: 37.5140,
    lng: 127.0645,
    weatherTags: ['any'],
    menus: [
      { name: "옛날간짜장", price: 11000 }
    ]
  },
  {
    id: "r_11",
    name: "성북동청국장",
    category: "한식",
    isBlueRibbon: false,
    lat: 37.5152,
    lng: 127.0615,
    weatherTags: ['any', 'hot'],
    menus: [
      { name: "육회비빔밥", price: 16000 }
    ]
  },
  {
    id: "r_12",
    name: "이남장",
    category: "한식",
    isBlueRibbon: false,
    lat: 37.5140,
    lng: 127.0632,
    weatherTags: ['cold', 'rain', 'any'],
    menus: [
      { name: "설렁탕", price: 14000 }
    ]
  },
  {
    id: "r_13",
    name: "노브랜드버거코엑스점",
    category: "패스트푸드",
    isBlueRibbon: false,
    lat: 37.5122,
    lng: 127.0592,
    weatherTags: ['any'],
    menus: [
      { name: "NBB어메이징감바스새우세트", price: 9200 }
    ]
  }
]; 

// Auto populate initialization script for base frequents.
export const BASE_FREQUENT_IDS = RESTAURANTS.map(r => r.id);
