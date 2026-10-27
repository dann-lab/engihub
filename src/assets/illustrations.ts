/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Static Illustration Assets & Course Covers
 * Aesthetic: Warm Nigerian campus study hall. Flat editorial style.
 * Includes low-data mode awareness: decorative imagery can be suppressed on 2G/3G.
 */

// Import generated static assets
import heroStudents from './images/students_studying_1793090455509.jpg';
import workshopImg from './images/engineering_workshop_1793090469032.jpg';
import solarRoofImg from './images/solar_panels_roof_1793090480197.jpg';
import boreholeImg from './images/borehole_pump_1793090493945.jpg';

export const ILLUSTRATIONS = {
  heroStudents: {
    src: heroStudents,
    alt: 'Nigerian engineering students collaborating around study table in campus study space',
    width: 1280,
    height: 720,
  },
  workshop: {
    src: workshopImg,
    alt: 'University mechanical engineering workshop with lathe machines and tools',
    width: 1280,
    height: 720,
  },
  solarRoof: {
    src: solarRoofImg,
    alt: 'Rooftop solar photovoltaic installation on campus faculty building',
    width: 1280,
    height: 720,
  },
  borehole: {
    src: boreholeImg,
    alt: 'Solar-powered community borehole pump station and overhead storage tank',
    width: 1280,
    height: 720,
  },
} as const;
