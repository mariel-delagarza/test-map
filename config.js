var config = {
  style: 'mapbox://styles/ilabmedia/clsev142703b401pbbksz6kyi?optimize=true',
  accessToken: 'pk.eyJ1IjoiaWxhYm1lZGlhIiwiYSI6ImNpbHYycXZ2bTAxajZ1c2tzdWU1b3gydnYifQ.AHxl8pPZsjsqoz95-604nw',
  showMarkers: false,
  inset: false,
  theme: 'light',
  use3dTerrain: false, 
  auto: false,
  chapters: [
      {
          id: 'slug-style-id',
          alignment: 'center',
          hidden: true,
          location: {
              center: [113.00673, 21.58082],
              zoom: 7.23,
              pitch: 0,
              bearing: 0
          },
          mapAnimation: 'flyTo',
          rotateAnimation: false,
          callback: '',
          onChapterEnter: [],
          onChapterExit: []
      },
      {
          id: 'first-identifier',
          alignment: 'right',
          hidden: false,
          description: 'On October 30th, the Zhu Hai Yun set off from its home port in Zhuhai, a bustling harbor tucked within the booming Greater Bay Area of southern China. ',
          location: {
              center: [113.15926, 21.77577],
              zoom: 8.87,
              pitch: 0,
              bearing: 0,
              speed: 0.2,
              curve: 1
          },
          mapAnimation: 'flyTo',
          rotateAnimation: false,
          callback: '',
          onChapterEnter: [],
          onChapterExit: []
      },
      {
          id: 'second-identifier',
          alignment: 'left',
          hidden: false,
          description: 'After steaming north along China’s coast for five days, the vessel came to port at a dock operated by the Dalian Institute of Measurement and Control Technology, an institute that studies ship vibration and acoustics for the Chinese navy.',
          location: {
              center: [120.93056, 36.17779],
              zoom: 5.26,
              pitch: 0,
              bearing: 0,
              speed: 0.7, // make the flying slow
              curve: 1, // change the speed at which it zooms out
          },
          mapAnimation: 'flyTo',
          rotateAnimation: false,
          callback: '',
          onChapterEnter: [],
          onChapterExit: []
      },
      {
          id: 'third-identifier',
          alignment: 'right',
          hidden: false,
          description: `As it returned south toward Zhuhai, after a brief stopover in Shanghai, the vessel made an unusual maneuver.
          <br>
          <br>
          Instead of transiting back through the Taiwan Strait, it sailed to the east of the island, an uncharacteristic path for a Chinese civilian ship.`,
          location: {
              center: [122.54761, 23.91854],
              zoom: 5.70,
              pitch: 0,
              bearing: 0.00,
              speed: 0.5,
          },
          mapAnimation: 'flyTo',
          rotateAnimation: false,
          callback: '',
          onChapterEnter: [],
          onChapterExit: []
      },
      {
          id: 'fourth-chapter',
          alignment: 'center',
          hidden: false,
          description: 'Just north of Taiwan, the Zhu Hai Yun briefly slowed to a near standstill, a sign that it was likely conducting a research operation.',
          location: {
              center: [122.72341, 26.09948],
              zoom: 6.45,
              pitch: 0,
              bearing: 0,
              speed: 0.2,
              curve: 1
          },
          mapAnimation: 'flyTo',
          rotateAnimation: false,
          callback: '',
          onChapterEnter: [],
          onChapterExit: []
      },
      {
          id: 'fifth-chapter',
          alignment: 'right',
          hidden: false,
          description: `It then continued south, skirting the eastern edge of Taiwan's contiguous zone. On November 15, the ship sailed just 24 nautical miles from the coast, its closest approach to the island.`,
          location: {
              center: [122.54837, 23.53983],
              zoom: 7.29,
              pitch: 0,
              bearing: 0,
              speed: 0.2,
              curve: 1
          },
          mapAnimation: 'flyTo',
          rotateAnimation: false,
          callback: '',
          onChapterEnter: [],
          onChapterExit: []
      },
      {
          id: 'sixth-chapter',
          alignment: 'center',
          hidden: false,
          description: `As it rounded the southern tip of the island, the Zhu Hai Yun appears to have briefly crossed through Taiwan's contiguous zone.`,
          location: {
              center: [121.30731, 21.73578],
              zoom: 8.12,
              pitch: 0,
              bearing: 0,
              speed: 0.2,
              curve: 1
          },
          mapAnimation: 'flyTo',
          rotateAnimation: false,
          callback: '',
          onChapterEnter: [],
          onChapterExit: []
      },
      {
          id: 'seventh-chapter',
          alignment: 'center',
          hidden: false,
          description: `This bizarre voyage—until now unreported in Taiwanese or international media—was notable not just for its irregular path, but also for the unique characteristics of the vessel undertaking it.`,
          location: {
              center: [118.70319, 24.71304],
              zoom: 5.59,
              pitch: 0,
              bearing: 0,
              speed: 0.5,
              curve: 1
          },
          mapAnimation: 'flyTo',
          rotateAnimation: false,
          callback: '',
          onChapterEnter: [],
          onChapterExit: []
      }
  ]
};
