import React from 'react'

function getAmenityIcon ({ Contents, longText, shortText }) {
  return <span aria-label={shortText} title={longText}><Contents /></span>
}

// Icons from iconmonstr.com, except where indicated.
const presetAmenityData = [
  {
    id: "accessible",
    Contents: () => <i className="amenity accessible" />,
    longText: "This stop is accessible to people with mobility impairments.",
    shortText: "Accessible"
  },
  {
    id: "lighting",
    Contents: () => <i className="amenity lighting" />,
    longText: "This stop is lit at night.",
    shortText: "Lighting"
  },
  {
    id: "map",
    Contents: () => <i className="amenity map" />,
    longText: "This stop has route maps.",
    shortText: "Map"
  },
  {
    id: "seating",
    // Derived from https://svgsilh.com/svg_v2/44084.svg (marked as public domain)
    Contents: () => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 1280">
        <g transform="translate(300,1280) scale(0.1,-0.1)" fill="#000000" stroke="none">
          <path d="M2112 12790 c-155 -22 -348 -87 -478 -162 -356 -204 -600 -548 -668 -943 -21 -117 -21 -343 0 -460 100 -581 574 -1031 1164 -1104 515 -65 1039 196 1312 654 136 227 205 533 180 794 -60 608 -487 1082 -1087 1206 -93 19 -332 28 -423 15z"/>
          <path d="M2305 9884 c-11 -3 -55 -11 -97 -20 -366 -70 -694 -317 -848 -638 -83 -175 -114 -341 -107 -570 4 -139 10 -188 46 -361 24 -110 168 -823 321 -1585 402 -2000 369 -1838 410 -1950 127 -351 401 -620 740 -729 182 -59 67 -55 1748 -61 l1542 -5 0 -1580 c0 -954 4 -1624 10 -1690 17 -192 71 -335 168 -448 90 -102 190 -168 327 -214 68 -22 98 -26 205 -27 144 -1 227 16 327 67 190 97 309 247 366 458 l22 84 0 2185 c0 1757 -3 2198 -13 2250 -44 220 -139 404 -284 550 -118 120 -259 200 -446 253 -77 22 -81 22 -1301 27 l-1224 5 -49 245 c-599 3017 -583 2943 -669 3112 -167 330 -436 543 -789 624 -64 15 -365 28 -405 18z"/>
          <path d="M422 8316 c-206 -50 -375 -223 -411 -420 -23 -126 -31 -79 158 -1001 49 -242 180 -881 290 -1420 110 -539 209 -1014 220 -1056 81 -306 237 -625 434 -888 96 -129 348 -381 474 -474 334 -247 684 -396 1069 -454 110 -17 212 -18 1289 -18 1113 0 1173 1 1230 19 205 63 336 208 379 418 20 97 20 139 1 234 -46 219 -171 355 -390 422 -43 14 -204 17 -1175 22 l-1125 6 -105 26 c-149 37 -190 52 -325 118 -148 72 -253 149 -370 271 -172 179 -293 398 -367 664 -18 63 -185 875 -523 2530 -64 314 -123 595 -131 625 -78 279 -348 442 -622 376z"/>
        </g>
      </svg>
    ),
    longText: "This stop has seating.",
    shortText: "Seating"
  },
  {
    id: "shelter",
    Contents: () => <i className="amenity shelter" />,
    longText: "This stop has a shelter.",
    shortText: "Shelter"
  },
  {
    id: "ticketing",
    Contents: () => <i className="amenity ticketing" />,
    longText: "This stop has ticket vending.",
    shortText: "Ticketing"
  },
  {
    id: "trash",
    Contents: () => <i className="amenity trash" />,
    longText: "This stop has a trash can.",
    shortText: "Trash can"
  },
  {
    id: "trafficLight",
    Contents: () => <>🚦</>,
    longText: "A traffic light is in the vicinity of this stop.",
    shortText: "Traffic light",
  },
  {
    id: "crosswalk",
    Contents: () => <i className="amenity crosswalk" />,
    longText: "This stop has a safe crosswalk nearby.",
    shortText: "Safe crosswalk"
  }
]

const presetAmenities = {}
presetAmenityData.forEach(a => {
  presetAmenities[a.id] = getAmenityIcon(a)
})

export default presetAmenities
