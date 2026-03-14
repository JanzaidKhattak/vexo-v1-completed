// Pakistan — Province → Cities
export const PAKISTAN_LOCATIONS = [
  {
    province: 'Punjab',
    cities: [
      'Lahore', 'Rawalpindi', 'Faisalabad', 'Gujranwala', 'Multan',
      'Sialkot', 'Bahawalpur', 'Sargodha', 'Sheikhupura', 'Jhang',
      'Rahim Yar Khan', 'Gujrat', 'Kasur', 'Sahiwal', 'Okara',
      'Attock', 'Chakwal', 'Jhelum', 'Mandi Bahauddin', 'Narowal',
      'Hafizabad', 'Chiniot', 'Pakpattan', 'Khanewal', 'Lodhran',
      'Vehari', 'Bahawalnagar', 'Muzaffargarh', 'Layyah', 'Bhakkar',
      'Khushab', 'Mianwali', 'Toba Tek Singh', 'Nankana Sahib',
    ],
  },
  {
    province: 'Sindh',
    cities: [
      'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah',
      'Mirpur Khas', 'Jacobabad', 'Shikarpur', 'Khairpur', 'Dadu',
      'Sanghar', 'Badin', 'Tando Adam', 'Tando Allahyar', 'Umerkot',
      'Thatta', 'Matiari', 'Jamshoro', 'Qambar Shahdadkot',
    ],
  },
  {
    province: 'Khyber Pakhtunkhwa',
    cities: [
      'Peshawar', 'Mardan', 'Abbottabad', 'Swat', 'Kohat',
      'Mansehra', 'Dera Ismail Khan', 'Swabi', 'Nowshera', 'Charsadda',
      'Bannu', 'Hangu', 'Karak', 'Lakki Marwat', 'Tank',
      'Haripur', 'Battagram', 'Buner', 'Shangla', 'Dir Upper',
      'Dir Lower', 'Chitral', 'Malakand',
    ],
  },
  {
    province: 'Balochistan',
    cities: [
      'Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Hub',
      'Chaman', 'Zhob', 'Loralai', 'Dera Bugti', 'Sibi',
      'Mastung', 'Kalat', 'Kharan', 'Washuk', 'Panjgur',
      'Nushki', 'Chagai',
    ],
  },
  {
    province: 'Islamabad Capital Territory',
    cities: ['Islamabad'],
  },
  {
    province: 'Azad Kashmir',
    cities: [
      'Muzaffarabad', 'Mirpur', 'Kotli', 'Rawalakot', 'Bagh',
      'Haveli', 'Sudhnoti', 'Neelum',
    ],
  },
  {
    province: 'Gilgit-Baltistan',
    cities: [
      'Gilgit', 'Skardu', 'Ghanche', 'Hunza', 'Nagar',
      'Astore', 'Diamer', 'Shigar',
    ],
  },
]

// Flat list of all cities for quick search
export const ALL_CITIES = PAKISTAN_LOCATIONS.flatMap(p =>
  p.cities.map(city => ({ city, province: p.province }))
)

// Get province for a city
export const getProvinceForCity = (cityName) => {
  const found = ALL_CITIES.find(c => c.city === cityName)
  return found?.province || null
}

export const DEFAULT_LOCATION = { city: 'Pakistan', province: null, isDefault: true }