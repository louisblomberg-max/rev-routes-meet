export interface VehicleVariant {
  name: string
}

export interface VehicleModel {
  name: string
  yearStart: number
  yearEnd: number
  variants: string[]
}

export interface VehicleMake {
  id: string
  name: string
  type: 'car' | 'motorcycle' | 'both'
  country: string
  models: VehicleModel[]
}

export const VEHICLE_DATABASE: VehicleMake[] = [

  // ─── CARS ───────────────────────────────────────────────

  {
    id: 'abarth',
    name: 'Abarth',
    type: 'car',
    country: 'Italy',
    models: [
      { name: '500', yearStart: 2008, yearEnd: 2025, variants: ['Base', '595', '595 Competizione', '595 Turismo', '695', '695 Biposto', '695 Rivale', '695 XSR Yamaha'] },
      { name: '124 Spider', yearStart: 2016, yearEnd: 2020, variants: ['Base', 'Scorpione'] },
      { name: 'Punto', yearStart: 1997, yearEnd: 2012, variants: ['Base', 'GT', 'S2000'] },
    ]
  },

  {
    id: 'alfa_romeo',
    name: 'Alfa Romeo',
    type: 'car',
    country: 'Italy',
    models: [
      { name: 'Giulia', yearStart: 2016, yearEnd: 2025, variants: ['Base', 'Super', 'Sprint', 'Veloce', 'Quadrifoglio'] },
      { name: 'Stelvio', yearStart: 2017, yearEnd: 2025, variants: ['Base', 'Super', 'Sprint', 'Veloce', 'Quadrifoglio'] },
      { name: 'GTA', yearStart: 1965, yearEnd: 1977, variants: ['GTA 1300 Junior', 'GTA 1600', 'GTA 2000'] },
      { name: 'Spider', yearStart: 1966, yearEnd: 1993, variants: ['1300', '1600', '2000', 'Series 1', 'Series 2', 'Series 3', 'Series 4'] },
      { name: '147', yearStart: 2000, yearEnd: 2010, variants: ['Base', 'Lusso', 'Veloce', 'GTA', 'GTA Cup'] },
      { name: '156', yearStart: 1997, yearEnd: 2007, variants: ['Base', 'Lusso', 'Sportwagon', 'GTA', 'GTA Sportwagon'] },
      { name: '159', yearStart: 2005, yearEnd: 2011, variants: ['Base', 'Lusso', 'Ti', 'Sportwagon', 'Sportwagon Ti'] },
      { name: 'Brera', yearStart: 2005, yearEnd: 2010, variants: ['2.2 JTS', '3.2 JTS', 'S'] },
      { name: 'MiTo', yearStart: 2008, yearEnd: 2018, variants: ['Base', 'Lusso', 'Sprint', 'Veloce', 'QV'] },
      { name: '4C', yearStart: 2013, yearEnd: 2020, variants: ['Coupe', 'Spider', 'Spider Italia'] },
      { name: '8C Competizione', yearStart: 2007, yearEnd: 2010, variants: ['Coupe', 'Spider'] },
      { name: 'GT', yearStart: 2003, yearEnd: 2010, variants: ['1.8 TS', '2.0 JTS', '3.2 V6'] },
      { name: 'Tonale', yearStart: 2022, yearEnd: 2025, variants: ['Sprint', 'Ti', 'Veloce', 'Quadrifoglio'] },
    ]
  },

  {
    id: 'alpine',
    name: 'Alpine',
    type: 'car',
    country: 'France',
    models: [
      { name: 'A110', yearStart: 2017, yearEnd: 2025, variants: ['Pure', 'Legende', 'S', 'GT', 'R', 'Premiere Edition'] },
      { name: 'A110 Classic', yearStart: 1961, yearEnd: 1977, variants: ['A110 1300', 'A110 1600', 'A110 1600 S', 'Berlinette'] },
    ]
  },

  {
    id: 'aston_martin',
    name: 'Aston Martin',
    type: 'car',
    country: 'UK',
    models: [
      { name: 'DB5', yearStart: 1963, yearEnd: 1965, variants: ['Saloon', 'Convertible', 'Shooting Brake'] },
      { name: 'DB6', yearStart: 1965, yearEnd: 1971, variants: ['Saloon', 'Volante', 'Mk II'] },
      { name: 'DB7', yearStart: 1994, yearEnd: 2004, variants: ['Coupe', 'Volante', 'Vantage', 'Vantage Volante', 'GT', 'GTA'] },
      { name: 'DB9', yearStart: 2004, yearEnd: 2016, variants: ['Coupe', 'Volante', 'GT', 'Carbon Edition'] },
      { name: 'DB11', yearStart: 2016, yearEnd: 2025, variants: ['V8', 'V12', 'AMR', 'Volante V8', 'Volante V12'] },
      { name: 'Vantage', yearStart: 2005, yearEnd: 2025, variants: ['V8', 'V12', 'S', 'N430', 'GT8', 'GT12', 'AMR', 'F1 Edition'] },
      { name: 'DBS', yearStart: 2007, yearEnd: 2025, variants: ['V12', 'Volante', 'Carbon Edition', 'Superleggera', 'Superleggera Volante', '770 Ultimate'] },
      { name: 'Rapide', yearStart: 2010, yearEnd: 2020, variants: ['Base', 'S', 'AMR', 'E'] },
      { name: 'Vanquish', yearStart: 2001, yearEnd: 2018, variants: ['Coupe', 'Volante', 'S', 'S Volante', 'Zagato', 'Zagato Volante', 'Zagato Shooting Brake'] },
      { name: 'DBX', yearStart: 2020, yearEnd: 2025, variants: ['DBX', 'DBX707'] },
      { name: 'Valkyrie', yearStart: 2021, yearEnd: 2025, variants: ['Coupe', 'AMR Pro', 'Spider'] },
    ]
  },

  {
    id: 'audi',
    name: 'Audi',
    type: 'car',
    country: 'Germany',
    models: [
      { name: 'A1', yearStart: 2010, yearEnd: 2025, variants: ['SE', 'Sport', 'S Line', 'Black Edition', 'S1', 'S1 Quattro'] },
      { name: 'A3', yearStart: 1996, yearEnd: 2025, variants: ['SE', 'Sport', 'S Line', 'Black Edition', 'Edition 1', 'S3', 'S3 Quattro', 'RS3', 'RS3 Performance'] },
      { name: 'A4', yearStart: 1994, yearEnd: 2025, variants: ['SE', 'Sport', 'S Line', 'Black Edition', 'S4', 'S4 Avant', 'RS4', 'RS4 Avant', 'RS4 Avant Plus'] },
      { name: 'A5', yearStart: 2007, yearEnd: 2025, variants: ['SE', 'Sport', 'S Line', 'Black Edition', 'S5', 'S5 Cabriolet', 'RS5', 'RS5 Sportback', 'Competition'] },
      { name: 'A6', yearStart: 1994, yearEnd: 2025, variants: ['SE', 'Sport', 'S Line', 'Black Edition', 'S6', 'RS6', 'RS6 Avant', 'RS6 Avant Performance'] },
      { name: 'A7', yearStart: 2010, yearEnd: 2025, variants: ['SE', 'Sport', 'S Line', 'Black Edition', 'S7', 'RS7', 'RS7 Performance'] },
      { name: 'A8', yearStart: 1994, yearEnd: 2025, variants: ['SE', 'Sport', 'S Line', 'S8', 'S8 Plus', 'W12', 'L'] },
      { name: 'Q2', yearStart: 2016, yearEnd: 2025, variants: ['SE', 'Sport', 'S Line', 'Black Edition', 'SQ2'] },
      { name: 'Q3', yearStart: 2011, yearEnd: 2025, variants: ['SE', 'Sport', 'S Line', 'Black Edition', 'RSQ3', 'RSQ3 Sportback'] },
      { name: 'Q5', yearStart: 2008, yearEnd: 2025, variants: ['SE', 'Sport', 'S Line', 'Black Edition', 'SQ5', 'SQ5 Plus'] },
      { name: 'Q7', yearStart: 2005, yearEnd: 2025, variants: ['SE', 'Sport', 'S Line', 'Black Edition', 'SQ7', 'SQ7 V8'] },
      { name: 'Q8', yearStart: 2018, yearEnd: 2025, variants: ['SE', 'Sport', 'S Line', 'Black Edition', 'SQ8', 'RSQ8'] },
      { name: 'TT', yearStart: 1998, yearEnd: 2023, variants: ['Coupe', 'Roadster', 'S', 'S Roadster', 'RS', 'RS Roadster', 'TTS', 'TTS Roadster'] },
      { name: 'R8', yearStart: 2006, yearEnd: 2024, variants: ['V8', 'V10', 'V10 Plus', 'V10 Performance', 'Spyder V8', 'Spyder V10', 'GT', 'GT Spyder'] },
      { name: 'e-tron GT', yearStart: 2021, yearEnd: 2025, variants: ['e-tron GT', 'RS e-tron GT', 'RS e-tron GT Performance'] },
    ]
  },

  {
    id: 'bentley',
    name: 'Bentley',
    type: 'car',
    country: 'UK',
    models: [
      { name: 'Continental GT', yearStart: 2003, yearEnd: 2025, variants: ['W12', 'V8', 'V8 S', 'GTC', 'GTC V8', 'GTC V8 S', 'Speed', 'Supersports', 'GT3-R', 'Mulliner'] },
      { name: 'Flying Spur', yearStart: 2005, yearEnd: 2025, variants: ['W12', 'V8', 'V8 S', 'Speed', 'Hybrid', 'Mulliner', 'Azure'] },
      { name: 'Bentayga', yearStart: 2015, yearEnd: 2025, variants: ['W12', 'V8', 'Hybrid', 'Speed', 'EWB', 'Azure', 'Mulliner'] },
      { name: 'Mulsanne', yearStart: 2010, yearEnd: 2020, variants: ['Base', 'Speed', 'Extended Wheelbase', 'Grand Limousine'] },
      { name: 'Turbo R', yearStart: 1985, yearEnd: 1997, variants: ['Base', 'Sport', 'Long Wheelbase'] },
      { name: 'Azure', yearStart: 1995, yearEnd: 2003, variants: ['Base', 'T'] },
    ]
  },

  {
    id: 'bmw',
    name: 'BMW',
    type: 'car',
    country: 'Germany',
    models: [
      { name: '1 Series', yearStart: 2004, yearEnd: 2025, variants: ['SE', 'Sport', 'M Sport', 'xDrive', 'M135i', 'M135i xDrive', 'M140i', 'M140i xDrive'] },
      { name: '2 Series', yearStart: 2013, yearEnd: 2025, variants: ['SE', 'Sport', 'M Sport', 'xDrive', 'M235i', 'M235i xDrive', 'M240i', 'M240i xDrive', 'M2', 'M2 Competition', 'M2 CS'] },
      { name: '3 Series', yearStart: 1975, yearEnd: 2025, variants: ['SE', 'Sport', 'M Sport', 'xDrive', 'M340i', 'M340i xDrive', 'M3', 'M3 Competition', 'M3 CS', 'M3 CSL', 'M3 Touring', 'M3 Touring Competition'] },
      { name: '4 Series', yearStart: 2013, yearEnd: 2025, variants: ['SE', 'Sport', 'M Sport', 'xDrive', 'M440i', 'M440i xDrive', 'M4', 'M4 Competition', 'M4 CS', 'M4 CSL', 'M4 GTS'] },
      { name: '5 Series', yearStart: 1972, yearEnd: 2025, variants: ['SE', 'Sport', 'M Sport', 'xDrive', 'M550i', 'M550i xDrive', 'M5', 'M5 Competition', 'M5 CS', 'M5 30 Jahre'] },
      { name: '6 Series', yearStart: 2003, yearEnd: 2019, variants: ['SE', 'Sport', 'M Sport', 'M6', 'M6 Gran Coupe', 'M6 Competition', 'M6 GTS'] },
      { name: '7 Series', yearStart: 1977, yearEnd: 2025, variants: ['SE', 'Sport', 'M Sport', 'xDrive', 'M760Li', 'Alpina B7', 'Individual'] },
      { name: '8 Series', yearStart: 1989, yearEnd: 2025, variants: ['840i', '840d', 'M850i', 'M8', 'M8 Competition', 'M8 Gran Coupe', 'M8 Competition Gran Coupe', 'Alpina B8'] },
      { name: 'X1', yearStart: 2009, yearEnd: 2025, variants: ['SE', 'Sport', 'M Sport', 'xDrive', 'xLine'] },
      { name: 'X2', yearStart: 2017, yearEnd: 2025, variants: ['SE', 'Sport', 'M Sport', 'xDrive', 'M35i'] },
      { name: 'X3', yearStart: 2003, yearEnd: 2025, variants: ['SE', 'Sport', 'M Sport', 'xDrive', 'M40i', 'M40d', 'X3 M', 'X3 M Competition'] },
      { name: 'X4', yearStart: 2014, yearEnd: 2025, variants: ['SE', 'Sport', 'M Sport', 'xDrive', 'M40i', 'M40d', 'X4 M', 'X4 M Competition'] },
      { name: 'X5', yearStart: 1999, yearEnd: 2025, variants: ['SE', 'Sport', 'M Sport', 'xDrive', 'M50i', 'M50d', 'X5 M', 'X5 M Competition', 'X5 M50e'] },
      { name: 'X6', yearStart: 2008, yearEnd: 2025, variants: ['SE', 'Sport', 'M Sport', 'xDrive', 'M50i', 'M50d', 'X6 M', 'X6 M Competition'] },
      { name: 'X7', yearStart: 2018, yearEnd: 2025, variants: ['xDrive40i', 'xDrive40d', 'M60i', 'M50d', 'Alpina XB7'] },
      { name: 'Z3', yearStart: 1995, yearEnd: 2002, variants: ['1.8', '1.9', '2.0', '2.2', '2.8', '3.0', 'M Roadster', 'M Coupe'] },
      { name: 'Z4', yearStart: 2002, yearEnd: 2025, variants: ['sDrive20i', 'sDrive30i', 'M40i', 'M40d', 'E89 sDrive20i', 'E89 sDrive35i', 'E89 sDrive35is'] },
      { name: 'i3', yearStart: 2013, yearEnd: 2022, variants: ['Base', 'i3s', '94Ah', '120Ah', 'Rex'] },
      { name: 'i4', yearStart: 2021, yearEnd: 2025, variants: ['eDrive40', 'M50', 'Gran Coupe'] },
      { name: 'i8', yearStart: 2014, yearEnd: 2020, variants: ['Coupe', 'Roadster', 'Protonic Dark Silver', 'Protonic Red'] },
      { name: 'iX', yearStart: 2021, yearEnd: 2025, variants: ['xDrive40', 'xDrive50', 'M60'] },
      { name: 'M2', yearStart: 2015, yearEnd: 2025, variants: ['M2', 'M2 Competition', 'M2 CS', 'M2 CS Racing'] },
      { name: 'M3', yearStart: 1986, yearEnd: 2025, variants: ['E30', 'E36', 'E46', 'E90', 'E92', 'E93', 'F80', 'G80', 'Competition', 'CS', 'CSL', 'Touring', 'Touring Competition'] },
      { name: 'M4', yearStart: 2014, yearEnd: 2025, variants: ['F82', 'F83', 'G82', 'G83', 'Competition', 'CS', 'CSL', 'GTS'] },
      { name: 'M5', yearStart: 1984, yearEnd: 2025, variants: ['E28', 'E34', 'E39', 'E60', 'E61', 'F10', 'F90', 'Competition', 'CS', '30 Jahre', 'Pure Metal'] },
    ]
  },

  {
    id: 'caterham',
    name: 'Caterham',
    type: 'car',
    country: 'UK',
    models: [
      { name: 'Seven', yearStart: 1973, yearEnd: 2025, variants: ['170', '270', '360', '420', '420R', '485', '485R', 'CSR 200', 'CSR 260', 'Super Sprint', 'SV', 'HPC'] },
      { name: 'Seven 160', yearStart: 2013, yearEnd: 2020, variants: ['Base', 'S'] },
      { name: 'Seven 270', yearStart: 2006, yearEnd: 2025, variants: ['Base', 'R', 'S'] },
    ]
  },

  {
    id: 'chevrolet',
    name: 'Chevrolet',
    type: 'car',
    country: 'USA',
    models: [
      { name: 'Corvette', yearStart: 1953, yearEnd: 2025, variants: ['C1', 'C2 Sting Ray', 'C3', 'C4', 'C5', 'C6', 'C6 Z06', 'C6 ZR1', 'C7 Stingray', 'C7 Z06', 'C7 ZR1', 'C7 Grand Sport', 'C8 Stingray', 'C8 Z06', 'C8 E-Ray', 'C8 ZR1'] },
      { name: 'Camaro', yearStart: 1966, yearEnd: 2024, variants: ['V6', 'SS', 'Z28', 'ZL1', '50th Anniversary', '1LE', 'COPO'] },
      { name: 'Silverado', yearStart: 1999, yearEnd: 2025, variants: ['WT', 'Custom', 'LT', 'LTZ', 'High Country', 'Trail Boss', 'ZR2'] },
      { name: 'El Camino', yearStart: 1959, yearEnd: 1987, variants: ['Base', 'Super Sport', 'Conquista', 'Royal Knight'] },
    ]
  },

  {
    id: 'citroen',
    name: 'Citroën',
    type: 'car',
    country: 'France',
    models: [
      { name: 'C2', yearStart: 2003, yearEnd: 2009, variants: ['Base', 'VTS', 'GT'] },
      { name: 'C3', yearStart: 2002, yearEnd: 2025, variants: ['Base', 'Exclusive', 'Picasso', 'Aircross', 'C3 Racing'] },
      { name: 'DS3', yearStart: 2009, yearEnd: 2019, variants: ['Base', 'DStyle', 'DSport', 'Racing', 'Cabrio'] },
      { name: 'Saxo', yearStart: 1996, yearEnd: 2004, variants: ['Base', 'SX', 'VSX', 'VTS', 'Cup'] },
      { name: 'Xsara Picasso', yearStart: 1999, yearEnd: 2010, variants: ['Base', 'LX', 'SX', 'Exclusive'] },
      { name: 'Berlingo', yearStart: 1996, yearEnd: 2025, variants: ['Base', 'Multispace', 'First', 'Feel', 'Shine'] },
    ]
  },

  {
    id: 'cupra',
    name: 'Cupra',
    type: 'car',
    country: 'Spain',
    models: [
      { name: 'Formentor', yearStart: 2020, yearEnd: 2025, variants: ['V2', 'V2 DSG', 'VZ', 'VZ 4Drive', 'VZ5'] },
      { name: 'Leon', yearStart: 2020, yearEnd: 2025, variants: ['V1', 'V2', 'VZ', 'VZ 4Drive', 'Estate VZ', 'Estate VZ 4Drive'] },
      { name: 'Born', yearStart: 2021, yearEnd: 2025, variants: ['58kWh', 'e-Boost 77kWh', 'e-Boost 82kWh'] },
      { name: 'Ateca', yearStart: 2018, yearEnd: 2023, variants: ['Base', '4Drive'] },
    ]
  },

  {
    id: 'dacia',
    name: 'Dacia',
    type: 'car',
    country: 'Romania',
    models: [
      { name: 'Sandero', yearStart: 2008, yearEnd: 2025, variants: ['Access', 'Essential', 'Expression', 'Stepway', 'RS'] },
      { name: 'Duster', yearStart: 2010, yearEnd: 2025, variants: ['Access', 'Essential', 'Expression', 'Journey', '4WD'] },
      { name: 'Logan', yearStart: 2004, yearEnd: 2025, variants: ['Base', 'MCV', 'Pick Up'] },
      { name: 'Spring', yearStart: 2021, yearEnd: 2025, variants: ['Essential', 'Expression', 'Extreme'] },
    ]
  },

  {
    id: 'dodge',
    name: 'Dodge',
    type: 'car',
    country: 'USA',
    models: [
      { name: 'Challenger', yearStart: 1970, yearEnd: 2023, variants: ['Base', 'SXT', 'GT', 'R/T', 'R/T Scat Pack', 'SRT 392', 'SRT Hellcat', 'SRT Hellcat Widebody', 'SRT Super Stock', 'SRT Demon', 'SRT Demon 170', 'Last Call'] },
      { name: 'Charger', yearStart: 1966, yearEnd: 2023, variants: ['Base', 'SXT', 'GT', 'R/T', 'R/T Scat Pack', 'SRT 392', 'SRT Hellcat', 'SRT Hellcat Widebody', 'SRT Redeye', 'Daytona'] },
      { name: 'Viper', yearStart: 1991, yearEnd: 2017, variants: ['RT/10', 'GTS', 'SRT-10', 'SRT-10 Coupe', 'SRT', 'ACR', 'GTC', 'TA', 'TA 2.0', 'GTS-R', 'Viper Cup'] },
      { name: 'Durango', yearStart: 1997, yearEnd: 2025, variants: ['SXT', 'GT', 'R/T', 'Citadel', 'SRT 392', 'SRT Hellcat'] },
    ]
  },

  {
    id: 'ferrari',
    name: 'Ferrari',
    type: 'car',
    country: 'Italy',
    models: [
      { name: '308', yearStart: 1975, yearEnd: 1985, variants: ['GTB', 'GTS', 'GTBi', 'GTSi', 'GTB Quattrovalvole', 'GTS Quattrovalvole'] },
      { name: '328', yearStart: 1985, yearEnd: 1989, variants: ['GTB', 'GTS'] },
      { name: '348', yearStart: 1989, yearEnd: 1995, variants: ['tb', 'ts', 'Spider', 'GT Competizione', 'Speciale'] },
      { name: '355', yearStart: 1994, yearEnd: 1999, variants: ['Berlinetta', 'Spider', 'GTS', 'F1 Berlinetta', 'F1 Spider', 'Challenge'] },
      { name: '360', yearStart: 1999, yearEnd: 2005, variants: ['Modena', 'Spider', 'Challenge', 'Stradale', 'Challenge Stradale'] },
      { name: '430', yearStart: 2004, yearEnd: 2009, variants: ['F430', 'F430 Spider', 'F430 Scuderia', 'F430 Scuderia Spider 16M', '430 Challenge'] },
      { name: '458', yearStart: 2009, yearEnd: 2015, variants: ['Italia', 'Spider', 'Speciale', 'Speciale A'] },
      { name: '488', yearStart: 2015, yearEnd: 2020, variants: ['GTB', 'Spider', 'Pista', 'Pista Spider', 'Challenge'] },
      { name: 'F8', yearStart: 2019, yearEnd: 2025, variants: ['Tributo', 'Spider'] },
      { name: '296', yearStart: 2021, yearEnd: 2025, variants: ['GTB', 'GTS', 'Challenge', 'GT3'] },
      { name: 'SF90', yearStart: 2019, yearEnd: 2025, variants: ['Stradale', 'Spider', 'XX Stradale', 'XX Spider'] },
      { name: 'Roma', yearStart: 2020, yearEnd: 2025, variants: ['Coupe', 'Spider'] },
      { name: 'Portofino', yearStart: 2017, yearEnd: 2022, variants: ['Base', 'M'] },
      { name: 'California', yearStart: 2008, yearEnd: 2017, variants: ['Base', 'T', '30 Anniversary'] },
      { name: 'GTC4Lusso', yearStart: 2016, yearEnd: 2020, variants: ['V12', 'V8 T'] },
      { name: '812', yearStart: 2017, yearEnd: 2025, variants: ['Superfast', 'GTS', 'Competizione', 'Competizione A'] },
      { name: 'Monza', yearStart: 2018, yearEnd: 2021, variants: ['SP1', 'SP2'] },
      { name: 'LaFerrari', yearStart: 2013, yearEnd: 2016, variants: ['Coupe', 'Aperta'] },
      { name: 'Enzo', yearStart: 2002, yearEnd: 2004, variants: ['Base'] },
      { name: 'F40', yearStart: 1987, yearEnd: 1992, variants: ['Base', 'LM', 'GT'] },
      { name: 'F50', yearStart: 1995, yearEnd: 1997, variants: ['Base'] },
      { name: 'Testarossa', yearStart: 1984, yearEnd: 1996, variants: ['Base', '512 TR', 'F512 M'] },
    ]
  },

  {
    id: 'fiat',
    name: 'Fiat',
    type: 'car',
    country: 'Italy',
    models: [
      { name: '500', yearStart: 1957, yearEnd: 2025, variants: ['Classic', 'Pop', 'Lounge', 'Sport', 'Abarth', '500e', '500 Cabrio', 'Gucci', 'Dolcevita'] },
      { name: '500X', yearStart: 2014, yearEnd: 2025, variants: ['Pop', 'Cross', 'Sport', 'S Design'] },
      { name: 'Punto', yearStart: 1993, yearEnd: 2018, variants: ['Base', 'ELX', 'HLX', 'Sporting', 'Abarth', 'Grande Punto', 'Evo'] },
      { name: 'Bravo', yearStart: 2007, yearEnd: 2014, variants: ['Dynamic', 'Emotion', 'Sport', 'Abarth'] },
      { name: 'Barchetta', yearStart: 1995, yearEnd: 2005, variants: ['Base', 'Limited Edition'] },
      { name: 'Coupe', yearStart: 1993, yearEnd: 2000, variants: ['1.8', '2.0', '2.0 Turbo', '2.0 Turbo Plus'] },
    ]
  },

  {
    id: 'ford',
    name: 'Ford',
    type: 'car',
    country: 'UK/USA',
    models: [
      { name: 'Fiesta', yearStart: 1976, yearEnd: 2023, variants: ['Base', 'Style', 'Zetec', 'Titanium', 'ST-Line', 'ST', 'ST-3', 'Vignale', 'Active', 'R2', 'S2000 Kit Car'] },
      { name: 'Focus', yearStart: 1998, yearEnd: 2025, variants: ['Base', 'Style', 'Zetec', 'Titanium', 'ST-Line', 'ST', 'ST-3', 'Active', 'Vignale', 'RS', 'RS500'] },
      { name: 'Mustang', yearStart: 1964, yearEnd: 2025, variants: ['V6', 'EcoBoost', 'GT', 'Bullitt', 'GT Premium', 'Mach 1', 'Shelby GT350', 'Shelby GT350R', 'Shelby GT500', 'Dark Horse', 'Mach-E GT'] },
      { name: 'Escort', yearStart: 1968, yearEnd: 2004, variants: ['Base', 'GL', 'Ghia', 'RS 1600', 'RS 1800', 'RS 2000', 'Mexico', 'Cosworth', 'RS Cosworth', 'WRC'] },
      { name: 'Sierra', yearStart: 1982, yearEnd: 1993, variants: ['Base', 'GL', 'Ghia', 'XR4i', 'RS Cosworth', 'RS500', 'Sapphire Cosworth'] },
      { name: 'Puma', yearStart: 1997, yearEnd: 2001, variants: ['1.4', '1.6', '1.7', 'Racing Puma'] },
      { name: 'Capri', yearStart: 1968, yearEnd: 1986, variants: ['1.3', '1.6', '2.0', '2.3', '3.0', 'RS 2600', 'RS 3100', 'Turbo'] },
      { name: 'GT', yearStart: 2005, yearEnd: 2022, variants: ['2005 GT', '2006 GT', '2017 GT', '2018 GT', '2019 GT', 'Liquid Carbon', 'Heritage Edition'] },
      { name: 'RS200', yearStart: 1984, yearEnd: 1986, variants: ['Base', 'Evolution'] },
      { name: 'F-150', yearStart: 1975, yearEnd: 2025, variants: ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited', 'Raptor', 'Raptor R', 'Lightning'] },
      { name: 'Ranger', yearStart: 1983, yearEnd: 2025, variants: ['XL', 'XLT', 'Lariat', 'Raptor', 'Wildtrak', 'Thunder', 'Stormtrak'] },
      { name: 'Galaxy', yearStart: 1995, yearEnd: 2025, variants: ['CL', 'GLX', 'Ghia', 'Zetec', 'Titanium'] },
      { name: 'Kuga', yearStart: 2008, yearEnd: 2025, variants: ['Zetec', 'Titanium', 'ST-Line', 'Vignale', 'PHEV', 'ST-Line X'] },
      { name: 'Mondeo', yearStart: 1993, yearEnd: 2022, variants: ['Base', 'LX', 'GLX', 'Ghia', 'Zetec', 'Titanium', 'ST', 'ST220', 'Vignale'] },
      { name: 'Pinto', yearStart: 1971, yearEnd: 1980, variants: ['Base', 'Runabout', 'Squire', 'Cruising Wagon'] },
    ]
  },

  {
    id: 'genesis',
    name: 'Genesis',
    type: 'car',
    country: 'South Korea',
    models: [
      { name: 'G70', yearStart: 2017, yearEnd: 2025, variants: ['2.0T', '3.3T', 'Sport', 'Shooting Brake'] },
      { name: 'G80', yearStart: 2016, yearEnd: 2025, variants: ['2.5T', '3.5T', 'Sport', 'Electrified'] },
      { name: 'G90', yearStart: 2016, yearEnd: 2025, variants: ['3.3T', '5.0L', 'Long Wheelbase'] },
      { name: 'GV70', yearStart: 2021, yearEnd: 2025, variants: ['2.5T', '3.5T', 'Sport', 'Electrified'] },
      { name: 'GV80', yearStart: 2020, yearEnd: 2025, variants: ['2.5T', '3.5T', 'Electrified'] },
    ]
  },

  {
    id: 'honda',
    name: 'Honda',
    type: 'car',
    country: 'Japan',
    models: [
      { name: 'Civic', yearStart: 1972, yearEnd: 2025, variants: ['Base', 'ES', 'EX', 'SE', 'Sport', 'Type R', 'Type R Limited Edition', 'Type R GT', 'EG6', 'EK9', 'EP3', 'FN2', 'FK2', 'FK8', 'FL5', 'Si'] },
      { name: 'Integra', yearStart: 1985, yearEnd: 2025, variants: ['Base', 'RS', 'LS', 'GS', 'GS-R', 'Type R', 'DC2', 'DC5'] },
      { name: 'NSX', yearStart: 1990, yearEnd: 2022, variants: ['Base', 'Type R', 'NA1', 'NA2', 'NC1', 'Type S'] },
      { name: 'S2000', yearStart: 1999, yearEnd: 2009, variants: ['AP1', 'AP2', 'CR'] },
      { name: 'Jazz', yearStart: 2001, yearEnd: 2025, variants: ['Base', 'ES', 'EX', 'SE', 'Sport', 'Crosstar', 'e:HEV'] },
      { name: 'CR-V', yearStart: 1995, yearEnd: 2025, variants: ['Base', 'ES', 'EX', 'SE', 'Sport', 'Hybrid', 'PHEV'] },
      { name: 'HR-V', yearStart: 1998, yearEnd: 2025, variants: ['Base', 'ES', 'EX', 'SE', 'Sport', 'e:HEV'] },
      { name: 'Accord', yearStart: 1976, yearEnd: 2025, variants: ['Base', 'ES', 'EX', 'SE', 'Sport', 'Type R', 'Tourer', 'Hybrid'] },
      { name: 'Legend', yearStart: 1986, yearEnd: 2012, variants: ['Base', 'V6', 'Type S'] },
      { name: 'Prelude', yearStart: 1978, yearEnd: 2001, variants: ['Base', 'VTi', 'Type S', 'Type SH'] },
      { name: 'CRX', yearStart: 1983, yearEnd: 1991, variants: ['Base', 'Si', 'Del Sol', 'VTi'] },
      { name: 'Beat', yearStart: 1991, yearEnd: 1996, variants: ['Base', 'Version Z'] },
    ]
  },

  {
    id: 'hyundai',
    name: 'Hyundai',
    type: 'car',
    country: 'South Korea',
    models: [
      { name: 'i20', yearStart: 2008, yearEnd: 2025, variants: ['Base', 'Active', 'N Line', 'N', 'WRC'] },
      { name: 'i30', yearStart: 2007, yearEnd: 2025, variants: ['Base', 'SE', 'Premium', 'N Line', 'N', 'Fastback N', 'N Performance', 'Tourer'] },
      { name: 'Kona', yearStart: 2017, yearEnd: 2025, variants: ['SE', 'Premium', 'N Line', 'N', 'Electric'] },
      { name: 'Tucson', yearStart: 2004, yearEnd: 2025, variants: ['SE', 'Premium', 'N Line', 'Ultimate', 'PHEV'] },
      { name: 'Santa Fe', yearStart: 2000, yearEnd: 2025, variants: ['SE', 'Premium', 'Ultimate', 'PHEV'] },
      { name: 'Ioniq 5', yearStart: 2021, yearEnd: 2025, variants: ['Standard Range', 'Long Range RWD', 'Long Range AWD', 'N'] },
      { name: 'Ioniq 6', yearStart: 2022, yearEnd: 2025, variants: ['Standard Range', 'Long Range RWD', 'Long Range AWD'] },
      { name: 'Genesis Coupe', yearStart: 2008, yearEnd: 2016, variants: ['2.0T', '3.8', 'R-Spec', 'Track Edition'] },
      { name: 'Veloster', yearStart: 2011, yearEnd: 2022, variants: ['Base', 'Turbo', 'N', 'Turbo R-Spec'] },
    ]
  },

  {
    id: 'jaguar',
    name: 'Jaguar',
    type: 'car',
    country: 'UK',
    models: [
      { name: 'E-Type', yearStart: 1961, yearEnd: 1974, variants: ['Series 1 3.8', 'Series 1 4.2', 'Series 1.5', 'Series 2', 'Series 3 V12', 'Roadster', 'Coupe', 'Fixed Head', '2+2'] },
      { name: 'XK', yearStart: 1996, yearEnd: 2014, variants: ['XK8', 'XKR', 'XKR-S', 'XKR GT', 'XKR Speed', 'Portfolio', '100th Anniversary'] },
      { name: 'XJ', yearStart: 1968, yearEnd: 2019, variants: ['Base', 'XJ6', 'XJR', 'XJ12', 'XJR-15', 'Sovereign', 'Supersport', 'Ultimate', 'L', 'Portfolio'] },
      { name: 'XF', yearStart: 2007, yearEnd: 2025, variants: ['Base', 'S', 'R', 'XFR', 'XFR-S', 'Sportbrake', 'Portfolio', '300 Sport'] },
      { name: 'XE', yearStart: 2014, yearEnd: 2024, variants: ['Base', 'SE', 'Portfolio', 'R-Sport', 'S', 'XE SV Project 8'] },
      { name: 'F-Type', yearStart: 2013, yearEnd: 2024, variants: ['Base', 'S', 'R', 'SVR', 'V6', 'V8', 'P300', 'P380', 'P450', 'P575 R', '60th Anniversary'] },
      { name: 'F-Pace', yearStart: 2016, yearEnd: 2025, variants: ['Base', 'SE', 'Portfolio', 'R-Sport', 'SVR', 'P400e', '300 Sport'] },
      { name: 'I-Pace', yearStart: 2018, yearEnd: 2024, variants: ['S', 'SE', 'HSE', 'HSE Black', 'EV400', 'EV320'] },
      { name: 'XJS', yearStart: 1975, yearEnd: 1996, variants: ['V12', '6.0', 'Cabriolet', 'Convertible', 'Collection Rouge'] },
    ]
  },

  {
    id: 'jeep',
    name: 'Jeep',
    type: 'car',
    country: 'USA',
    models: [
      { name: 'Wrangler', yearStart: 1986, yearEnd: 2025, variants: ['Sport', 'Sahara', 'Rubicon', 'Unlimited', 'Mojave', '392 Rubicon', 'Willys', 'Black Bear', '4xe'] },
      { name: 'Cherokee', yearStart: 1974, yearEnd: 2025, variants: ['Sport', 'Latitude', 'Limited', 'Trailhawk', 'Overland', 'High Altitude'] },
      { name: 'Grand Cherokee', yearStart: 1992, yearEnd: 2025, variants: ['Laredo', 'Limited', 'Overland', 'Summit', 'SRT', 'SRT8', 'Trackhawk', 'Trailhawk', '4xe', 'L'] },
      { name: 'Renegade', yearStart: 2014, yearEnd: 2025, variants: ['Sport', 'Longitude', 'Limited', 'Trailhawk', 'Night Eagle'] },
      { name: 'Gladiator', yearStart: 2019, yearEnd: 2025, variants: ['Sport', 'Sport S', 'Overland', 'Rubicon', 'Mojave', 'High Altitude'] },
    ]
  },

  {
    id: 'kia',
    name: 'Kia',
    type: 'car',
    country: 'South Korea',
    models: [
      { name: 'Ceed', yearStart: 2006, yearEnd: 2025, variants: ['Base', 'SE', 'GT Line', 'GT', 'Sportswagon', 'ProCeed'] },
      { name: 'Stinger', yearStart: 2017, yearEnd: 2022, variants: ['GT', 'GT S', 'GT Line', '3.3T AWD'] },
      { name: 'EV6', yearStart: 2021, yearEnd: 2025, variants: ['Air', 'Wind', 'GT Line', 'GT', 'GT-Line AWD'] },
      { name: 'Sportage', yearStart: 1993, yearEnd: 2025, variants: ['Base', 'SE', 'GT Line', 'GT Line S', 'PHEV', 'HEV'] },
      { name: 'Soul', yearStart: 2008, yearEnd: 2025, variants: ['Base', 'SE', 'GT Line', 'EV', 'Turbo'] },
      { name: 'Rio', yearStart: 2000, yearEnd: 2025, variants: ['Base', 'SE', 'GT Line', 'Sport'] },
    ]
  },

  {
    id: 'lamborghini',
    name: 'Lamborghini',
    type: 'car',
    country: 'Italy',
    models: [
      { name: 'Miura', yearStart: 1966, yearEnd: 1973, variants: ['P400', 'P400 S', 'P400 SV', 'Jota'] },
      { name: 'Countach', yearStart: 1974, yearEnd: 1990, variants: ['LP400', 'LP400 S', 'LP500 S', 'LP5000 QV', '25th Anniversary', '2022 LPI 800-4'] },
      { name: 'Diablo', yearStart: 1990, yearEnd: 2001, variants: ['Base', 'VT', 'SV', 'SE30', 'GT', 'GTR', '6.0', '6.0 SE'] },
      { name: 'Murciélago', yearStart: 2001, yearEnd: 2010, variants: ['Base', 'Roadster', 'LP 640', 'LP 640 Roadster', 'LP 650-4 Roadster', 'LP 670-4 SuperVeloce', 'LP 670-4 SV China Edition', 'Versace'] },
      { name: 'Gallardo', yearStart: 2003, yearEnd: 2013, variants: ['Base', 'Spyder', 'Superleggera', 'LP 560-4', 'LP 560-4 Spyder', 'LP 570-4 Superleggera', 'LP 570-4 Performante', 'LP 550-2', 'LP 550-2 Tricolore', 'LP 560-4 Bicolore'] },
      { name: 'Huracán', yearStart: 2014, yearEnd: 2025, variants: ['LP 610-4', 'LP 580-2', 'LP 610-4 Spyder', 'LP 580-2 Spyder', 'Performante', 'Performante Spyder', 'Evo', 'Evo Spyder', 'Evo RWD', 'Evo RWD Spyder', 'STO', 'Sterrato', 'Tecnica'] },
      { name: 'Urus', yearStart: 2018, yearEnd: 2025, variants: ['Base', 'Pearl Capsule', 'Graphite Capsule', 'S', 'SE'] },
      { name: 'Reventón', yearStart: 2007, yearEnd: 2010, variants: ['Coupe', 'Roadster'] },
      { name: 'Sesto Elemento', yearStart: 2010, yearEnd: 2013, variants: ['Base'] },
      { name: 'Aventador', yearStart: 2011, yearEnd: 2022, variants: ['LP 700-4', 'LP 700-4 Roadster', 'LP 720-4 50° Anniversario', 'LP 750-4 SuperVeloce', 'LP 750-4 SV Roadster', 'LP 740-4 S', 'LP 740-4 S Roadster', 'SVJ', 'SVJ Roadster', 'LP 780-4 Ultimae', 'LP 780-4 Ultimae Roadster'] },
      { name: 'Revuelto', yearStart: 2023, yearEnd: 2025, variants: ['Base'] },
    ]
  },

  {
    id: 'land_rover',
    name: 'Land Rover',
    type: 'car',
    country: 'UK',
    models: [
      { name: 'Defender', yearStart: 1983, yearEnd: 2025, variants: ['90', '110', '130', 'S', 'SE', 'HSE', 'X', 'X-Dynamic', 'Carpathian Edition', 'Trophy Edition', 'V8', 'V8 Carpathian Edition', 'Works V8'] },
      { name: 'Discovery', yearStart: 1989, yearEnd: 2025, variants: ['Base', 'S', 'SE', 'HSE', 'HSE Luxury', 'Sport SE', 'Sport HSE', 'Sport HSE Dynamic', 'Sport SVX', 'Metropolitan Edition'] },
      { name: 'Range Rover', yearStart: 1970, yearEnd: 2025, variants: ['Classic', 'SE', 'HSE', 'Vogue', 'Vogue SE', 'Autobiography', 'SVAutobiography', 'SVR', 'Sport', 'Sport SE', 'Sport HSE', 'Sport SVR', 'Sport SVR Carbon', 'Evoque', 'Velar', 'SV'] },
      { name: 'Freelander', yearStart: 1997, yearEnd: 2014, variants: ['Base', 'S', 'SE', 'HSE', 'xS', 'GS', 'Limited Edition'] },
    ]
  },

  {
    id: 'lexus',
    name: 'Lexus',
    type: 'car',
    country: 'Japan',
    models: [
      { name: 'IS', yearStart: 1998, yearEnd: 2025, variants: ['200', '250', '300', '300h', '350', '500', 'F', '200t', 'IS-F'] },
      { name: 'GS', yearStart: 1991, yearEnd: 2020, variants: ['300', '350', '430', '450h', '460', '460L', '300h', 'F'] },
      { name: 'LS', yearStart: 1989, yearEnd: 2025, variants: ['400', '430', '460', '460 L', '500', '500 L', '500h', 'F Sport'] },
      { name: 'RC', yearStart: 2014, yearEnd: 2025, variants: ['200t', '300', '300h', '350', 'F', 'F Carbon'] },
      { name: 'LC', yearStart: 2017, yearEnd: 2025, variants: ['500', '500h', '500 Convertible', 'Inspiration Series'] },
      { name: 'LFA', yearStart: 2010, yearEnd: 2012, variants: ['Base', 'Nürburgring Package'] },
      { name: 'UX', yearStart: 2018, yearEnd: 2025, variants: ['200', '250h', '300e', 'F Sport'] },
      { name: 'NX', yearStart: 2014, yearEnd: 2025, variants: ['200t', '300', '300h', '350', '350h', '450h+', 'F Sport'] },
      { name: 'RX', yearStart: 1997, yearEnd: 2025, variants: ['300', '330', '350', '400h', '450h', '450h+', '500h', 'F Sport'] },
    ]
  },

  {
    id: 'lotus',
    name: 'Lotus',
    type: 'car',
    country: 'UK',
    models: [
      { name: 'Elise', yearStart: 1996, yearEnd: 2021, variants: ['S1', 'S2', 'S3', 'Sport 135', 'Sport 190', 'SC', '111S', '111R', 'Cup 250', 'Sport 220', 'Classic', 'Sprint'] },
      { name: 'Exige', yearStart: 2000, yearEnd: 2021, variants: ['S1', 'S2', 'S3', 'S240', 'S260', 'V6', 'V6 S', 'Sport 350', 'Sport 380', 'Sport 410', 'Sport 430', 'Cup 430', 'Final Edition'] },
      { name: 'Evora', yearStart: 2009, yearEnd: 2021, variants: ['Base', 'S', 'GTE', 'GX', 'Sport 410', 'Sport 430', '400', 'GT', 'GT430'] },
      { name: 'Emira', yearStart: 2021, yearEnd: 2025, variants: ['V6', 'I4', 'GT4'] },
      { name: 'Europa', yearStart: 1966, yearEnd: 1975, variants: ['S1', 'S2', 'Twin Cam', 'Special', 'John Player Special'] },
      { name: 'Esprit', yearStart: 1976, yearEnd: 2004, variants: ['S1', 'S2', 'S2.2', 'S3', 'Turbo', 'HC', 'SE', 'Sport 300', 'S4', 'S4s', 'GT3', 'V8', 'V8 SE', 'Sport 350'] },
      { name: 'Elan', yearStart: 1962, yearEnd: 1995, variants: ['S1', 'S2', 'S3', 'S4', 'Sprint', 'Plus 2', 'M100 SE', 'M100 S'] },
    ]
  },

  {
    id: 'maserati',
    name: 'Maserati',
    type: 'car',
    country: 'Italy',
    models: [
      { name: 'Ghibli', yearStart: 1966, yearEnd: 2023, variants: ['Classic', 'S Q4', 'S', 'GranSport', 'Trofeo', 'Hybrid'] },
      { name: 'Quattroporte', yearStart: 1963, yearEnd: 2025, variants: ['Base', 'S', 'GTS', 'GTS MC', 'Sport GT S', 'S Q4', 'GranSport', 'Trofeo'] },
      { name: 'GranTurismo', yearStart: 2007, yearEnd: 2025, variants: ['Base', 'S', 'MC', 'Sport', 'Folgore', 'Trofeo'] },
      { name: 'GranCabrio', yearStart: 2010, yearEnd: 2025, variants: ['Base', 'Sport', 'MC', 'Folgore'] },
      { name: 'Levante', yearStart: 2016, yearEnd: 2025, variants: ['Base', 'S', 'GranSport', 'GranLusso', 'Trofeo', 'Hybrid'] },
      { name: 'MC20', yearStart: 2020, yearEnd: 2025, variants: ['Coupe', 'Cielo', 'Notte'] },
      { name: 'Bora', yearStart: 1971, yearEnd: 1978, variants: ['4.7', '4.9'] },
      { name: 'Merak', yearStart: 1972, yearEnd: 1983, variants: ['Base', 'SS'] },
    ]
  },

  {
    id: 'mazda',
    name: 'Mazda',
    type: 'car',
    country: 'Japan',
    models: [
      { name: 'MX-5', yearStart: 1989, yearEnd: 2025, variants: ['NA', 'NB', 'NC', 'ND', 'SE', 'Sport', 'Sport Nav', 'GT Sport', 'GT Sport Tech', 'R-Sport', 'RF', 'RF Launch Edition', 'Icon', 'Exclusive', '100th Anniversary', 'Exclusive-Line', 'Homura'] },
      { name: 'RX-7', yearStart: 1978, yearEnd: 2002, variants: ['SA22C', 'FB', 'FC', 'FD', 'Turbo II', 'Type R', 'Type RZ', 'Spirit R', 'Infini', 'GT Limited', 'Efini'] },
      { name: 'RX-8', yearStart: 2003, yearEnd: 2012, variants: ['Base', 'Sport', 'SE', 'PZ', 'Type S', 'R3'] },
      { name: '3', yearStart: 2003, yearEnd: 2025, variants: ['SE', 'SE-L', 'Sport', 'GT Sport', 'Takumi', 'Fastback', 'Saloon', 'MPS'] },
      { name: '6', yearStart: 2002, yearEnd: 2023, variants: ['S', 'SE', 'SE-L', 'Sport', 'GT Sport', 'Tourer', 'MPS'] },
      { name: 'CX-5', yearStart: 2012, yearEnd: 2025, variants: ['SE', 'SE-L', 'Sport', 'GT Sport', 'GT Sport Tech', 'Takumi', 'Carbon Edition', 'Homura'] },
      { name: 'CX-60', yearStart: 2022, yearEnd: 2025, variants: ['Exclusive-Line', 'Homura', 'Takumi', 'PHEV', 'e-Skyactiv D'] },
      { name: '323', yearStart: 1977, yearEnd: 2003, variants: ['Base', 'LX', 'SE', 'GT', 'Turbo', 'F', 'P5', 'Familia'] },
    ]
  },

  {
    id: 'mclaren',
    name: 'McLaren',
    type: 'car',
    country: 'UK',
    models: [
      { name: 'F1', yearStart: 1992, yearEnd: 1998, variants: ['Road Car', 'GT', 'LM', 'GTR'] },
      { name: 'MP4-12C', yearStart: 2011, yearEnd: 2014, variants: ['Coupe', 'Spider'] },
      { name: '650S', yearStart: 2014, yearEnd: 2017, variants: ['Coupe', 'Spider', 'Can-Am Edition', 'Le Mans Edition'] },
      { name: '675LT', yearStart: 2015, yearEnd: 2016, variants: ['Coupe', 'Spider'] },
      { name: '570S', yearStart: 2015, yearEnd: 2020, variants: ['Coupe', 'Spider', 'GT', 'Track Pack', 'Sprint'] },
      { name: '600LT', yearStart: 2018, yearEnd: 2020, variants: ['Coupe', 'Spider'] },
      { name: '720S', yearStart: 2017, yearEnd: 2023, variants: ['Coupe', 'Spider', 'Performance', 'Le Mans', 'GT'] },
      { name: '765LT', yearStart: 2020, yearEnd: 2022, variants: ['Coupe', 'Spider'] },
      { name: 'Senna', yearStart: 2018, yearEnd: 2019, variants: ['Base', 'GTR'] },
      { name: 'Speedtail', yearStart: 2020, yearEnd: 2022, variants: ['Base'] },
      { name: 'Elva', yearStart: 2020, yearEnd: 2022, variants: ['Base'] },
      { name: 'Artura', yearStart: 2021, yearEnd: 2025, variants: ['Base', 'Trophy'] },
      { name: 'GTS', yearStart: 2024, yearEnd: 2025, variants: ['Base'] },
    ]
  },

  {
    id: 'mercedes',
    name: 'Mercedes-Benz',
    type: 'car',
    country: 'Germany',
    models: [
      { name: 'A-Class', yearStart: 1997, yearEnd: 2025, variants: ['SE', 'Sport', 'AMG Line', 'AMG Line Premium', 'A35 AMG', 'A45 AMG', 'A45 S AMG', 'Night Edition'] },
      { name: 'B-Class', yearStart: 2005, yearEnd: 2025, variants: ['SE', 'Sport', 'AMG Line', 'B200', 'Electric Drive'] },
      { name: 'C-Class', yearStart: 1993, yearEnd: 2025, variants: ['SE', 'Sport', 'AMG Line', 'Premium', 'C43 AMG', 'C55 AMG', 'C63 AMG', 'C63 S AMG', 'C63 S E Performance', 'Black Series'] },
      { name: 'E-Class', yearStart: 1984, yearEnd: 2025, variants: ['SE', 'Sport', 'AMG Line', 'Premium', 'E43 AMG', 'E53 AMG', 'E63 AMG', 'E63 S AMG', 'Estate', 'Cabriolet', 'Coupe'] },
      { name: 'S-Class', yearStart: 1972, yearEnd: 2025, variants: ['SE', 'AMG Line', 'Premium', 'S500', 'S560', 'S63 AMG', 'S65 AMG', 'S680 Maybach', 'Pullman', 'Guard'] },
      { name: 'CLA', yearStart: 2013, yearEnd: 2025, variants: ['SE', 'Sport', 'AMG Line', 'CLA35 AMG', 'CLA45 AMG', 'CLA45 S AMG', 'Shooting Brake'] },
      { name: 'CLS', yearStart: 2004, yearEnd: 2024, variants: ['SE', 'AMG Line', 'CLS53 AMG', 'CLS55 AMG', 'CLS63 AMG', 'CLS63 S AMG'] },
      { name: 'GLA', yearStart: 2013, yearEnd: 2025, variants: ['SE', 'Sport', 'AMG Line', 'GLA35 AMG', 'GLA45 AMG', 'GLA45 S AMG'] },
      { name: 'GLB', yearStart: 2019, yearEnd: 2025, variants: ['SE', 'Sport', 'AMG Line', 'GLB35 AMG'] },
      { name: 'GLC', yearStart: 2015, yearEnd: 2025, variants: ['SE', 'Sport', 'AMG Line', 'GLC43 AMG', 'GLC63 AMG', 'GLC63 S AMG', 'Coupe'] },
      { name: 'GLE', yearStart: 2015, yearEnd: 2025, variants: ['SE', 'Sport', 'AMG Line', 'GLE53 AMG', 'GLE63 AMG', 'GLE63 S AMG', 'Coupe', 'Maybach'] },
      { name: 'GLS', yearStart: 2012, yearEnd: 2025, variants: ['SE', 'AMG Line', 'GLS580', 'AMG GLS63', 'Maybach GLS600', 'Maybach GLS680'] },
      { name: 'G-Class', yearStart: 1979, yearEnd: 2025, variants: ['G300', 'G320', 'G350d', 'G400d', 'G500', 'G550', 'G55 AMG', 'G63 AMG', 'G65 AMG', 'G63 AMG Edition 55', 'Professional'] },
      { name: 'SL', yearStart: 1954, yearEnd: 2025, variants: ['300SL', '190SL', 'Pagoda', 'R107', 'R129', 'R230', 'R231', 'R232', 'SL43 AMG', 'SL55 AMG', 'SL63 AMG', 'SL65 AMG', 'Black Series'] },
      { name: 'SLK', yearStart: 1996, yearEnd: 2016, variants: ['200', '230', '280', '300', '320', '350', 'R170', 'R171', 'R172', 'AMG', '55 AMG'] },
      { name: 'AMG GT', yearStart: 2014, yearEnd: 2025, variants: ['GT', 'GT S', 'GT C', 'GT R', 'GT R Pro', 'GT Black Series', 'GT 4-Door', '43', '53', '63 S', '63 S 4MATIC+', '63 S E Performance'] },
      { name: 'SLS AMG', yearStart: 2010, yearEnd: 2014, variants: ['Coupe', 'Roadster', 'GT Coupe', 'GT Roadster', 'GT Final Edition', 'Black Series', 'Electric Drive'] },
      { name: 'EQS', yearStart: 2021, yearEnd: 2025, variants: ['350', '450+', '450 4MATIC', '53 AMG 4MATIC+', 'SUV'] },
      { name: 'EQE', yearStart: 2022, yearEnd: 2025, variants: ['350', '350+', '500 4MATIC', '53 AMG 4MATIC+', 'SUV'] },
    ]
  },

  {
    id: 'mg',
    name: 'MG',
    type: 'car',
    country: 'UK/China',
    models: [
      { name: 'MGB', yearStart: 1962, yearEnd: 1980, variants: ['Roadster', 'GT', 'V8', 'LE', 'Limited Edition'] },
      { name: 'MGF', yearStart: 1995, yearEnd: 2002, variants: ['Base', 'VVC', 'Trophy 160', 'Trophy 180', 'LE500'] },
      { name: 'MG TF', yearStart: 2002, yearEnd: 2011, variants: ['115', '120', '135', '160', 'LE500'] },
      { name: 'ZR', yearStart: 2001, yearEnd: 2005, variants: ['105', '120', '160'] },
      { name: 'ZS', yearStart: 2001, yearEnd: 2005, variants: ['105', '120', '180'] },
      { name: 'ZT', yearStart: 2001, yearEnd: 2005, variants: ['120', '160', '190', 'V8'] },
      { name: 'MG3', yearStart: 2013, yearEnd: 2025, variants: ['Base', 'SE', 'Sport', 'Excite', 'Exclusive', 'Trophy', 'Hybrid+'] },
      { name: 'MG4', yearStart: 2022, yearEnd: 2025, variants: ['SE', 'SE Long Range', 'Trophy', 'Trophy Long Range', 'XPOWER'] },
      { name: 'MG5', yearStart: 2021, yearEnd: 2025, variants: ['SE', 'Trophy', 'Long Range SE', 'Long Range Trophy'] },
      { name: 'ZS EV', yearStart: 2019, yearEnd: 2025, variants: ['SE', 'Excite', 'Trophy', 'Long Range SE', 'Long Range Trophy'] },
      { name: 'HS', yearStart: 2018, yearEnd: 2025, variants: ['Base', 'SE', 'Excite', 'Trophy', 'PHEV'] },
    ]
  },

  {
    id: 'mini',
    name: 'Mini',
    type: 'car',
    country: 'UK',
    models: [
      { name: 'Classic Mini', yearStart: 1959, yearEnd: 2000, variants: ['Base', 'Cooper', 'Cooper S', 'Clubman', 'Mayfair', 'Rover Cooper', 'Rover Cooper S', 'Paul Smith', 'Final Edition'] },
      { name: 'Hatch', yearStart: 2001, yearEnd: 2025, variants: ['One', 'Cooper', 'Cooper S', 'JCW', 'JCW GP', 'Exclusive', 'Sport', 'Camden', 'Hampton', 'Sidewalk', 'Nightfall', 'Electric'] },
      { name: 'Convertible', yearStart: 2004, yearEnd: 2025, variants: ['One', 'Cooper', 'Cooper S', 'JCW', 'Sidewalk', 'Highgate', 'Hampton'] },
      { name: 'Clubman', yearStart: 2007, yearEnd: 2025, variants: ['One', 'Cooper', 'Cooper S', 'JCW', 'ALL4', 'JCW ALL4'] },
      { name: 'Countryman', yearStart: 2010, yearEnd: 2025, variants: ['One', 'Cooper', 'Cooper S', 'Cooper D', 'JCW', 'ALL4', 'JCW ALL4', 'PHEV', 'Electric'] },
      { name: 'Paceman', yearStart: 2012, yearEnd: 2016, variants: ['One', 'Cooper', 'Cooper S', 'JCW', 'ALL4'] },
      { name: 'Coupe', yearStart: 2011, yearEnd: 2015, variants: ['One', 'Cooper', 'Cooper S', 'JCW', 'Works'] },
      { name: 'Roadster', yearStart: 2011, yearEnd: 2015, variants: ['One', 'Cooper', 'Cooper S', 'JCW'] },
    ]
  },

  {
    id: 'mitsubishi',
    name: 'Mitsubishi',
    type: 'car',
    country: 'Japan',
    models: [
      { name: 'Lancer Evolution', yearStart: 1992, yearEnd: 2016, variants: ['Evo I', 'Evo II', 'Evo III', 'Evo IV', 'Evo V', 'Evo VI', 'Evo VI Tommi Makinen', 'Evo VII', 'Evo VIII', 'Evo VIII MR', 'Evo IX', 'Evo IX MR', 'Evo X', 'Evo X FQ-300', 'Evo X FQ-360', 'Evo X FQ-400', 'Final Edition'] },
      { name: 'Eclipse', yearStart: 1989, yearEnd: 2011, variants: ['GS', 'GS Turbo', 'GSX', 'GST', 'GT', 'Spyder'] },
      { name: '3000GT', yearStart: 1990, yearEnd: 1999, variants: ['Base', 'VR-4', 'SL', 'Spyder'] },
      { name: 'Galant VR-4', yearStart: 1987, yearEnd: 1993, variants: ['Base', 'AMG'] },
      { name: 'Colt', yearStart: 1962, yearEnd: 2012, variants: ['Base', 'Ralliart', 'CZC', 'Version R'] },
      { name: 'Outlander', yearStart: 2001, yearEnd: 2025, variants: ['Base', 'GX3', 'GX4', 'Phev', 'Sport'] },
      { name: 'L200', yearStart: 1978, yearEnd: 2025, variants: ['GL', 'GLS', 'Animal', 'Titan', 'Warrior', 'Barbarian'] },
    ]
  },

  {
    id: 'morgan',
    name: 'Morgan',
    type: 'car',
    country: 'UK',
    models: [
      { name: 'Plus 4', yearStart: 1950, yearEnd: 2025, variants: ['Base', 'Super Sport', 'Sport', '4 Seater', 'Lowline', 'Competition'] },
      { name: 'Plus 6', yearStart: 2019, yearEnd: 2025, variants: ['Base', 'GT'] },
      { name: '4/4', yearStart: 1936, yearEnd: 2019, variants: ['Series I', 'Series II', 'Series III', 'Series IV', 'Series V', 'Competition', 'Sport'] },
      { name: 'Roadster', yearStart: 2004, yearEnd: 2019, variants: ['Base', '3.7', 'V6'] },
      { name: 'Aero 8', yearStart: 2000, yearEnd: 2010, variants: ['Base', 'GT', 'Supersports'] },
      { name: 'Super 3', yearStart: 2022, yearEnd: 2025, variants: ['Base', 'Centenary Edition'] },
      { name: 'Plus Four', yearStart: 2020, yearEnd: 2025, variants: ['Base', 'CX-T', 'Bestseller Edition'] },
    ]
  },

  {
    id: 'nissan',
    name: 'Nissan',
    type: 'car',
    country: 'Japan',
    models: [
      { name: 'Skyline GT-R', yearStart: 1969, yearEnd: 2002, variants: ['KPGC10 Hakosuka', 'KPGC110 Kenmeri', 'R32 GT-R', 'R32 GT-R V-Spec', 'R32 GT-R V-Spec II', 'R33 GT-R', 'R33 GT-R V-Spec', 'R33 GT-R LM', 'R34 GT-R', 'R34 GT-R V-Spec', 'R34 GT-R V-Spec II', 'R34 GT-R V-Spec II Nur', 'R34 GT-R M-Spec', 'R34 GT-R M-Spec Nur'] },
      { name: 'GT-R', yearStart: 2007, yearEnd: 2025, variants: ['Premium', 'Black Edition', 'Track Edition', 'NISMO', 'NISMO Special Edition', '50th Anniversary', 'T-Spec', 'Pure Edition'] },
      { name: '370Z', yearStart: 2008, yearEnd: 2021, variants: ['Base', 'Sport', 'GT', 'Nismo', 'Nismo Tech', '40th Anniversary', 'Black Edition', 'Roadster'] },
      { name: '350Z', yearStart: 2002, yearEnd: 2009, variants: ['Base', 'Touring', 'Track', 'Enthusiast', 'Nismo', 'Grand Touring', 'Roadster'] },
      { name: '240SX / 180SX', yearStart: 1988, yearEnd: 1998, variants: ['SE', 'LE', 'Type X', 'Type S', 'Type R', 'Kouki', 'Zenki', 'Chuki'] },
      { name: 'Silvia', yearStart: 1965, yearEnd: 2002, variants: ['S12', 'S13', 'S14', 'S15', 'Q\'s', 'K\'s', 'Spec R', 'Spec S'] },
      { name: 'Micra', yearStart: 1982, yearEnd: 2025, variants: ['Visia', 'Acenta', 'Tekna', 'N-Sport', 'BOSE Personal Edition'] },
      { name: 'Juke', yearStart: 2010, yearEnd: 2025, variants: ['Visia', 'Acenta', 'Tekna', 'N-Sport', 'NISMO', 'NISMO RS'] },
      { name: 'Qashqai', yearStart: 2006, yearEnd: 2025, variants: ['Visia', 'Acenta', 'N-Connecta', 'Tekna', 'N-Sport', 'NISMO'] },
      { name: 'Leaf', yearStart: 2010, yearEnd: 2025, variants: ['Visia', 'Acenta', 'N-Connecta', 'Tekna', 'NISMO', 'e+'] },
      { name: 'Ariya', yearStart: 2021, yearEnd: 2025, variants: ['Evolve', 'Advance', 'Advance+', 'Evolve+ e-4ORCE'] },
    ]
  },

  {
    id: 'pagani',
    name: 'Pagani',
    type: 'car',
    country: 'Italy',
    models: [
      { name: 'Zonda', yearStart: 1999, yearEnd: 2017, variants: ['C12', 'C12 S', 'C12 F', 'C12 F Roadster', 'Roadster', 'Roadster F', 'Cinque', 'Cinque Roadster', 'Tricolore', 'R', 'Revolucion', '760 RS'] },
      { name: 'Huayra', yearStart: 2011, yearEnd: 2025, variants: ['Base', 'Roadster', 'BC', 'BC Roadster', 'Imola', 'Tricolore', 'Codalunga', 'Roadster BC'] },
    ]
  },

  {
    id: 'peugeot',
    name: 'Peugeot',
    type: 'car',
    country: 'France',
    models: [
      { name: '205', yearStart: 1983, yearEnd: 1998, variants: ['GTI 1.6', 'GTI 1.9', 'T16', 'Rallye', 'XS', 'XL', 'CTI', 'Cabriolet'] },
      { name: '306', yearStart: 1993, yearEnd: 2002, variants: ['XR', 'XN', 'XT', 'XS', 'GTI-6', 'Rallye', 'Cabriolet', 'S16'] },
      { name: '406', yearStart: 1995, yearEnd: 2004, variants: ['LX', 'GLX', 'SLX', 'HDi', 'Coupe', 'Break'] },
      { name: '207', yearStart: 2006, yearEnd: 2012, variants: ['Access', 'X Line', 'Sport', 'GT', 'GTI', 'Rallye', 'CC'] },
      { name: '208', yearStart: 2012, yearEnd: 2025, variants: ['Access', 'Active', 'Allure', 'GT', 'GTi 30th', 'GT Line', 'e-208', 'Rallye'] },
      { name: '308', yearStart: 2007, yearEnd: 2025, variants: ['Access', 'Active', 'Allure', 'GT', 'GT Line', 'GTI', 'SW', 'e-308'] },
      { name: 'RCZ', yearStart: 2010, yearEnd: 2015, variants: ['Base', 'R'] },
      { name: '2008', yearStart: 2013, yearEnd: 2025, variants: ['Access', 'Active', 'Allure', 'GT', 'GT Line', 'e-2008'] },
      { name: '3008', yearStart: 2009, yearEnd: 2025, variants: ['Access', 'Active', 'Allure', 'GT', 'GT Line', 'Hybrid4', 'PHEV'] },
    ]
  },

  {
    id: 'polestar',
    name: 'Polestar',
    type: 'car',
    country: 'Sweden',
    models: [
      { name: 'Polestar 1', yearStart: 2019, yearEnd: 2021, variants: ['Base'] },
      { name: 'Polestar 2', yearStart: 2020, yearEnd: 2025, variants: ['Standard Range', 'Long Range Single', 'Long Range Dual', 'BST Edition 270'] },
      { name: 'Polestar 3', yearStart: 2023, yearEnd: 2025, variants: ['Long Range', 'Long Range Dual', 'Long Range Performance'] },
      { name: 'Polestar 4', yearStart: 2024, yearEnd: 2025, variants: ['Long Range Single', 'Long Range Dual'] },
      { name: 'Polestar 6', yearStart: 2026, yearEnd: 2026, variants: ['Base'] },
    ]
  },

  {
    id: 'porsche',
    name: 'Porsche',
    type: 'car',
    country: 'Germany',
    models: [
      { name: '356', yearStart: 1948, yearEnd: 1965, variants: ['Pre-A', 'A', 'B', 'C', 'Speedster', 'Cabriolet', 'Coupe'] },
      { name: '911', yearStart: 1963, yearEnd: 2025, variants: ['Carrera', 'Carrera S', 'Carrera 4', 'Carrera 4S', 'Carrera T', 'Carrera GTS', 'Targa 4', 'Targa 4S', 'Targa 4 GTS', 'Cabriolet', 'Cabriolet S', 'Cabriolet 4S', 'Turbo', 'Turbo S', 'Turbo Cabriolet', 'Turbo S Cabriolet', 'GT3', 'GT3 RS', 'GT3 Touring', 'GT3 R', 'GT2', 'GT2 RS', 'R', 'Sport Classic', 'Dakar', 'Safari', 'S', '2.0', '2.2', '2.4', '2.7 RS', '3.0 RS', 'SC', 'SC RS', '930 Turbo', '964 Carrera', '964 RS', '993 Carrera', '993 RS', '996 GT3', '997 GT3', '991 GT3'] },
      { name: '912', yearStart: 1965, yearEnd: 1969, variants: ['Base', 'E'] },
      { name: '914', yearStart: 1969, yearEnd: 1976, variants: ['1.7', '2.0', '4', '6'] },
      { name: '944', yearStart: 1982, yearEnd: 1991, variants: ['Base', 'S', 'S2', 'Turbo', 'Turbo S', 'Cabriolet'] },
      { name: '968', yearStart: 1991, yearEnd: 1995, variants: ['Base', 'CS', 'Sport', 'Cabriolet'] },
      { name: '928', yearStart: 1977, yearEnd: 1995, variants: ['Base', 'S', 'S4', 'GTS'] },
      { name: 'Boxster', yearStart: 1996, yearEnd: 2025, variants: ['Base', 'S', 'GTS', 'GTS 4.0', 'Spyder', 'RS 60', '25 Years', 'Style Edition', '718 Base', '718 S', '718 GTS', '718 Spyder', '718 Spyder RS'] },
      { name: 'Cayman', yearStart: 2005, yearEnd: 2025, variants: ['Base', 'S', 'R', 'GTS', 'GT4', 'GT4 RS', 'GT4 Clubsport', '718 Base', '718 S', '718 GTS', '718 GT4', '718 GT4 RS', 'Style Edition'] },
      { name: 'Cayenne', yearStart: 2002, yearEnd: 2025, variants: ['Base', 'S', 'GTS', 'Turbo', 'Turbo S', 'Turbo E-Hybrid', 'Turbo S E-Hybrid', 'E-Hybrid', 'Coupe', 'Coupe GTS', 'Coupe Turbo', 'Coupe Turbo GT', 'Platinum Edition'] },
      { name: 'Macan', yearStart: 2014, yearEnd: 2025, variants: ['Base', 'S', 'GTS', 'Turbo', 'T', 'Electric', 'Electric Turbo'] },
      { name: 'Panamera', yearStart: 2009, yearEnd: 2025, variants: ['Base', 'S', '4S', 'GTS', 'Turbo', 'Turbo S', 'Turbo S E-Hybrid', '4 E-Hybrid', 'Executive', 'Sport Turismo'] },
      { name: 'Taycan', yearStart: 2019, yearEnd: 2025, variants: ['Base', '4S', 'Turbo', 'Turbo S', 'Turbo GT', 'Cross Turismo', 'GTS', 'GTS Sport Turismo', 'Sport Turismo'] },
    ]
  },

  {
    id: 'renault',
    name: 'Renault',
    type: 'car',
    country: 'France',
    models: [
      { name: 'Clio', yearStart: 1990, yearEnd: 2025, variants: ['Base', 'Expression', 'Dynamique', 'Privilege', 'GT Line', 'RS', 'RS Trophy', 'RS 200', 'Williams', 'Cup', 'V6 Renault Sport', 'Hybrid E-Tech'] },
      { name: 'Megane', yearStart: 1995, yearEnd: 2025, variants: ['Base', 'Expression', 'Dynamique', 'Privilege', 'GT Line', 'RS', 'RS Trophy', 'RS Cup', 'RS 300', 'R26.R', 'Trophy R', 'E-Tech'] },
      { name: 'Zoe', yearStart: 2012, yearEnd: 2025, variants: ['Life', 'Play', 'Iconic', 'GT Line', 'GT Line+', 'R135'] },
      { name: 'Laguna', yearStart: 1993, yearEnd: 2015, variants: ['Base', 'Expression', 'Privilege', 'GT', 'Estate', 'Coupe'] },
      { name: 'Alpine A110', yearStart: 1961, yearEnd: 1977, variants: ['A110 1300', 'A110 1600', 'A110 1600 S', 'Berlinette'] },
      { name: 'R5', yearStart: 1972, yearEnd: 1996, variants: ['Base', 'TS', 'GTL', 'Turbo', 'Turbo 2', 'Maxi Turbo', 'GT Turbo', 'Campus'] },
      { name: 'Scenic', yearStart: 1996, yearEnd: 2025, variants: ['Base', 'Expression', 'Dynamique', 'Privilege', 'GT Line', 'E-Tech', 'Grand Scenic'] },
      { name: '5', yearStart: 2024, yearEnd: 2025, variants: ['Evolution', 'Techno', 'Iconic', 'E-Tech'] },
    ]
  },

  {
    id: 'rolls_royce',
    name: 'Rolls-Royce',
    type: 'car',
    country: 'UK',
    models: [
      { name: 'Silver Shadow', yearStart: 1965, yearEnd: 1980, variants: ['Base', 'Long Wheelbase', 'Corniche', 'Silver Wraith II'] },
      { name: 'Silver Spirit', yearStart: 1980, yearEnd: 1998, variants: ['Base', 'Silver Spur', 'Silver Spur III', 'Silver Dawn'] },
      { name: 'Silver Seraph', yearStart: 1998, yearEnd: 2002, variants: ['Base', 'Park Ward'] },
      { name: 'Phantom', yearStart: 2003, yearEnd: 2025, variants: ['VII', 'VIII', 'Extended', 'Drophead', 'Coupe', 'Tempus Collection', 'Oribe', 'Koa'] },
      { name: 'Ghost', yearStart: 2009, yearEnd: 2025, variants: ['Base', 'Extended', 'Black Badge', 'Series II', 'EWB'] },
      { name: 'Wraith', yearStart: 2013, yearEnd: 2023, variants: ['Base', 'Black Badge', 'Eagle VIII', 'Inspired by Music', 'Luminary Collection'] },
      { name: 'Dawn', yearStart: 2015, yearEnd: 2023, variants: ['Base', 'Black Badge', 'Silver Bullet'] },
      { name: 'Cullinan', yearStart: 2018, yearEnd: 2025, variants: ['Base', 'Black Badge', 'Series II'] },
      { name: 'Spectre', yearStart: 2023, yearEnd: 2025, variants: ['Base', 'Black Badge'] },
      { name: 'Corniche', yearStart: 1971, yearEnd: 1995, variants: ['Coupe', 'Convertible', 'III', 'IV', 'S'] },
    ]
  },

  {
    id: 'seat',
    name: 'Seat',
    type: 'car',
    country: 'Spain',
    models: [
      { name: 'Ibiza', yearStart: 1984, yearEnd: 2025, variants: ['Base', 'S', 'SE', 'FR', 'Cupra', 'Cupra R', 'SC'] },
      { name: 'Leon', yearStart: 1998, yearEnd: 2025, variants: ['S', 'SE', 'FR', 'Cupra', 'Cupra R', 'Sportstourer', 'ST FR', 'PHEV FR'] },
      { name: 'Arona', yearStart: 2017, yearEnd: 2025, variants: ['S', 'SE', 'FR', 'Xcellence', 'FR Sport'] },
      { name: 'Ateca', yearStart: 2016, yearEnd: 2025, variants: ['S', 'SE', 'FR', 'Xcellence', 'Cupra'] },
      { name: 'Tarraco', yearStart: 2018, yearEnd: 2025, variants: ['SE', 'FR', 'Xcellence', 'FR Sport', 'FR Plus'] },
    ]
  },

  {
    id: 'skoda',
    name: 'Skoda',
    type: 'car',
    country: 'Czech Republic',
    models: [
      { name: 'Octavia', yearStart: 1996, yearEnd: 2025, variants: ['S', 'SE', 'SE L', 'vRS', 'vRS 245', 'Estate', 'Estate SE', 'Estate vRS', 'Scout'] },
      { name: 'Fabia', yearStart: 1999, yearEnd: 2025, variants: ['S', 'SE', 'SE Comfort', 'Monte Carlo', 'Scout', 'vRS'] },
      { name: 'Superb', yearStart: 2001, yearEnd: 2025, variants: ['S', 'SE', 'SE L', 'SportLine', 'Laurin & Klement', 'Estate', 'Estate SE', 'iV'] },
      { name: 'Karoq', yearStart: 2017, yearEnd: 2025, variants: ['S', 'SE', 'SE L', 'SportLine', 'Scout', 'Sportline Business'] },
      { name: 'Kodiaq', yearStart: 2016, yearEnd: 2025, variants: ['S', 'SE', 'SE L', 'SportLine', 'Scout', 'vRS', 'L&K'] },
      { name: 'Enyaq', yearStart: 2020, yearEnd: 2025, variants: ['iV 60', 'iV 80', 'iV 80x', 'iV RS', 'Coupe RS', '60 Suite', '80 Suite'] },
    ]
  },

  {
    id: 'subaru',
    name: 'Subaru',
    type: 'car',
    country: 'Japan',
    models: [
      { name: 'Impreza WRX', yearStart: 1992, yearEnd: 2025, variants: ['WRX', 'WRX STI', 'WRX STI S204', 'WRX STI RA-R', 'WRX STI Type RA', 'P1', 'Type UK', 'Spec C', 'Version V', 'WRX TR', 'WRX Limited'] },
      { name: 'BRZ', yearStart: 2012, yearEnd: 2025, variants: ['R', 'S', 'SE', 'Limited', 'tS', 'STI Sport', 'Premium', 'WR Blue mica'] },
      { name: 'Forester', yearStart: 1997, yearEnd: 2025, variants: ['XS', 'XT', 'STI', 'XE', 'SE', 'Premium', 'Sport', 'e-BOXER'] },
      { name: 'Outback', yearStart: 1994, yearEnd: 2025, variants: ['Base', 'SE', 'SE Premium', 'XS', 'XT', 'Lineartronic', 'Field'] },
      { name: 'SVX', yearStart: 1991, yearEnd: 1996, variants: ['Base', 'LS', 'LSi', 'LSL'] },
      { name: 'Legacy', yearStart: 1989, yearEnd: 2025, variants: ['L', 'GL', 'LSi', 'GT', 'GTB', 'B4', 'RS', 'SE', 'Touring Sport'] },
    ]
  },

  {
    id: 'suzuki',
    name: 'Suzuki',
    type: 'car',
    country: 'Japan',
    models: [
      { name: 'Swift', yearStart: 1983, yearEnd: 2025, variants: ['Base', 'GL', 'GLX', 'Sport', 'Sport AllGrip', 'RS', 'Z Series'] },
      { name: 'Jimny', yearStart: 1970, yearEnd: 2025, variants: ['SJ', 'Samurai', 'Base', 'JLX', 'JLX+', 'Ranger', 'Sierra'] },
      { name: 'Vitara', yearStart: 1988, yearEnd: 2025, variants: ['Base', 'SZ3', 'SZ4', 'SZ5', 'S-Cross', 'AllGrip', 'Hybrid'] },
      { name: 'Cappuccino', yearStart: 1991, yearEnd: 1998, variants: ['Base', 'Special Edition'] },
      { name: 'Ignis', yearStart: 2000, yearEnd: 2025, variants: ['GLS', 'Sport', 'SZ3', 'SZ5', 'AllGrip'] },
    ]
  },

  {
    id: 'tesla',
    name: 'Tesla',
    type: 'car',
    country: 'USA',
    models: [
      { name: 'Model S', yearStart: 2012, yearEnd: 2025, variants: ['60', '70D', '75', '75D', '85', '85D', 'P85D', '90D', 'P90D', '100D', 'P100D', 'Long Range', 'Plaid', 'Plaid+'] },
      { name: 'Model 3', yearStart: 2017, yearEnd: 2025, variants: ['Standard Range', 'Standard Range Plus', 'Long Range', 'Long Range AWD', 'Performance', 'Highland Standard Range', 'Highland Long Range', 'Highland Performance'] },
      { name: 'Model X', yearStart: 2015, yearEnd: 2025, variants: ['60D', '75D', '90D', 'P90D', '100D', 'P100D', 'Long Range', 'Plaid'] },
      { name: 'Model Y', yearStart: 2020, yearEnd: 2025, variants: ['Standard Range', 'Long Range', 'Long Range AWD', 'Performance', 'Juniper Long Range', 'Juniper Performance'] },
      { name: 'Cybertruck', yearStart: 2023, yearEnd: 2025, variants: ['All-Wheel Drive', 'Cyberbeast'] },
      { name: 'Roadster', yearStart: 2008, yearEnd: 2012, variants: ['Base', 'Sport', '2.5'] },
    ]
  },

  {
    id: 'toyota',
    name: 'Toyota',
    type: 'car',
    country: 'Japan',
    models: [
      { name: 'Supra', yearStart: 1978, yearEnd: 2025, variants: ['A40', 'A60', 'A70', 'A80 Twin Turbo', 'A80 Non Turbo', 'A80 RZ', 'A90 Base', 'A90 Pro', 'A91 GR', 'A91 GR Heritage Edition', 'A91 GR 45th Anniversary'] },
      { name: 'GT86 / GR86', yearStart: 2012, yearEnd: 2025, variants: ['Base', 'Primo', 'GT', 'GR', 'GR Premium', 'GR Circuit Pack', 'Aero', 'Club Series', 'Sprint'] },
      { name: 'GR Yaris', yearStart: 2020, yearEnd: 2025, variants: ['Base', 'Circuit Pack', 'Morizo Edition', 'RZ High Performance'] },
      { name: 'MR2', yearStart: 1984, yearEnd: 2007, variants: ['AW11', 'SW20 NA', 'SW20 Turbo', 'ZZW30 Base', 'ZZW30 SMT', 'Roadster'] },
      { name: 'Celica', yearStart: 1970, yearEnd: 2006, variants: ['TA22', 'RA28', 'RA60', 'ST162', 'ST165 GT-Four', 'ST182', 'ST185 GT-Four', 'ST202', 'ST205 GT-Four', 'ZZT230 T Sport', 'ZZT231 190'] },
      { name: 'GR Corolla', yearStart: 2022, yearEnd: 2025, variants: ['Core', 'Premium', 'Circuit Edition', 'Morizo Edition'] },
      { name: 'Corolla', yearStart: 1966, yearEnd: 2025, variants: ['Base', 'Saloon', 'Estate', 'Touring Sports', 'GR Sport', 'Hybrid'] },
      { name: 'Yaris', yearStart: 1999, yearEnd: 2025, variants: ['Base', 'T2', 'T3', 'T Spirit', 'SR', 'RS', 'GR Sport', 'Hybrid'] },
      { name: 'Land Cruiser', yearStart: 1951, yearEnd: 2025, variants: ['40 Series', '55 Series', '60 Series', '70 Series', '80 Series', '100 Series', '200 Series', '300 Series', 'Prado', 'Amazon'] },
      { name: 'RAV4', yearStart: 1994, yearEnd: 2025, variants: ['Base', 'XT3', 'XT4', 'XT5', 'GX', 'Hybrid', 'PHEV', 'Adventure', 'Dynamic'] },
      { name: 'GR Supra', yearStart: 2019, yearEnd: 2025, variants: ['Base', 'Pro', 'A91 Edition', 'Heritage Edition', '45th Anniversary Edition', 'Matte Storm Grey'] },
    ]
  },

  {
    id: 'tvr',
    name: 'TVR',
    type: 'car',
    country: 'UK',
    models: [
      { name: 'Griffith', yearStart: 1963, yearEnd: 2017, variants: ['400', '500', '4.0', '5.0', 'SE', '500 SE', '500 Sports Racer'] },
      { name: 'Chimaera', yearStart: 1992, yearEnd: 2003, variants: ['400', '430', '450', '500', '5.0', '400 SE'] },
      { name: 'Cerbera', yearStart: 1994, yearEnd: 2003, variants: ['4.2', '4.5', 'Speed 6', 'AJP6'] },
      { name: 'Tuscan', yearStart: 1999, yearEnd: 2006, variants: ['S', '2', 'R', 'S 4.0', 'Speed Six'] },
      { name: 'Sagaris', yearStart: 2004, yearEnd: 2006, variants: ['Base'] },
      { name: 'T350', yearStart: 2002, yearEnd: 2006, variants: ['Base', 'C'] },
      { name: 'Tamora', yearStart: 2001, yearEnd: 2006, variants: ['Base'] },
    ]
  },

  {
    id: 'vauxhall',
    name: 'Vauxhall',
    type: 'car',
    country: 'UK',
    models: [
      { name: 'Astra', yearStart: 1979, yearEnd: 2025, variants: ['Base', 'Life', 'Design', 'SRi', 'GTC', 'VXR', 'OPC', 'Sports Tourer', 'Electric', 'GSe'] },
      { name: 'Corsa', yearStart: 1982, yearEnd: 2025, variants: ['Base', 'Life', 'Design', 'GS Line', 'SRi', 'VXR', 'OPC', 'Electric', 'GSe'] },
      { name: 'Cavalier', yearStart: 1975, yearEnd: 1995, variants: ['GL', 'GLS', 'CD', 'CDi', 'GSi 2000', 'Turbo 4x4'] },
      { name: 'Nova', yearStart: 1983, yearEnd: 1993, variants: ['Base', 'LS', 'L', 'GL', 'GTE', 'GSi'] },
      { name: 'Vectra', yearStart: 1988, yearEnd: 2008, variants: ['Base', 'LS', 'GL', 'GLS', 'CD', 'SRi', 'OPC', 'Estate'] },
      { name: 'Insignia', yearStart: 2008, yearEnd: 2022, variants: ['Base', 'Design', 'SRi', 'Elite', 'VXR', 'OPC', 'Sports Tourer', 'Country Tourer', 'GSi'] },
      { name: 'Mokka', yearStart: 2012, yearEnd: 2025, variants: ['Base', 'Design', 'GS Line', 'SRi', 'Elite', 'Ultimate', 'Electric', 'GSe'] },
      { name: 'VX220', yearStart: 2000, yearEnd: 2005, variants: ['Base', 'Turbo', 'NA', 'Limited Edition'] },
      { name: 'Monaro', yearStart: 2004, yearEnd: 2006, variants: ['V6', 'V8', 'VXR'] },
      { name: 'Ampera', yearStart: 2012, yearEnd: 2015, variants: ['Base', 'Electron'] },
    ]
  },

  {
    id: 'volkswagen',
    name: 'Volkswagen',
    type: 'car',
    country: 'Germany',
    models: [
      { name: 'Golf', yearStart: 1974, yearEnd: 2025, variants: ['S', 'SE', 'Match', 'GT', 'GTE', 'GTI', 'GTI Performance', 'GTI Clubsport', 'GTI TCR', 'R', 'R32', 'GTD', 'Alltrack', 'Estate', 'SV', 'Mk1', 'Mk2', 'Mk3', 'Mk4', 'Mk5', 'Mk6', 'Mk7', 'Mk8'] },
      { name: 'Polo', yearStart: 1975, yearEnd: 2025, variants: ['S', 'SE', 'Match', 'Beats', 'R Line', 'GTI', 'GTI Cup', 'Cross', 'Bluemotion', 'WRC Edition'] },
      { name: 'Passat', yearStart: 1973, yearEnd: 2025, variants: ['S', 'SE', 'SE Business', 'GT', 'GTE', 'R Line', 'Estate', 'R36', 'W8'] },
      { name: 'Scirocco', yearStart: 1974, yearEnd: 2017, variants: ['Mk1', 'Mk2', 'Mk3', 'GT', 'GTS', 'R', 'Storm', 'Million'] },
      { name: 'Corrado', yearStart: 1988, yearEnd: 1995, variants: ['1.8', 'G60', '2.0', 'VR6', 'Storm'] },
      { name: 'Phaeton', yearStart: 2002, yearEnd: 2016, variants: ['V6 TDI', 'V8', 'W12', '3.0 TDI', '6.0 W12'] },
      { name: 'Arteon', yearStart: 2017, yearEnd: 2023, variants: ['SE', 'SE R-Line', 'R-Line', 'R', 'Shooting Brake', 'eHybrid'] },
      { name: 'ID.3', yearStart: 2020, yearEnd: 2025, variants: ['Pure', 'Pure Performance', 'Pro', 'Pro S', 'Tour', '1st Edition', 'GTX'] },
      { name: 'ID.4', yearStart: 2020, yearEnd: 2025, variants: ['Life', 'Style', 'Max', 'GTX', 'GTX Max'] },
      { name: 'ID.5', yearStart: 2021, yearEnd: 2025, variants: ['Style', 'Max', 'GTX', 'GTX Max'] },
      { name: 'Beetle', yearStart: 1938, yearEnd: 2019, variants: ['Classic', 'Cabriolet', 'RSi', 'Dune', 'Final Edition', '1200', '1300', '1302', '1303', 'Herbie'] },
      { name: 'Touareg', yearStart: 2002, yearEnd: 2025, variants: ['SE', 'Sport', 'Altitude', 'Black Edition', 'R', 'R-Line', 'eHybrid'] },
      { name: 'T-Roc', yearStart: 2017, yearEnd: 2025, variants: ['S', 'SE', 'Design', 'R-Line', 'Cabriolet', 'R', 'R Cabriolet'] },
      { name: 'T-Cross', yearStart: 2018, yearEnd: 2025, variants: ['S', 'SE', 'Style', 'R-Line'] },
      { name: 'Tiguan', yearStart: 2007, yearEnd: 2025, variants: ['S', 'SE', 'SEL', 'R-Line', 'Allspace', 'R', 'eHybrid', 'Black Edition'] },
      { name: 'Sharan', yearStart: 1995, yearEnd: 2022, variants: ['S', 'SE', 'SEL', 'Highline'] },
      { name: 'Up!', yearStart: 2011, yearEnd: 2024, variants: ['Take Up', 'Move Up', 'High Up', 'GTI', 'e-up!'] },
    ]
  },

  {
    id: 'volvo',
    name: 'Volvo',
    type: 'car',
    country: 'Sweden',
    models: [
      { name: 'C30', yearStart: 2006, yearEnd: 2013, variants: ['S', 'SE', 'SE Sport', 'R-Design', 'Electric'] },
      { name: 'S60', yearStart: 2000, yearEnd: 2025, variants: ['S', 'SE', 'SE Sport', 'R-Design', 'T6 AWD', 'Polestar', 'T8 Twin Engine'] },
      { name: 'V60', yearStart: 2010, yearEnd: 2025, variants: ['S', 'SE', 'SE Sport', 'R-Design', 'Cross Country', 'Polestar', 'T8 Twin Engine', 'Recharge'] },
      { name: 'S90', yearStart: 2016, yearEnd: 2025, variants: ['Momentum', 'Inscription', 'R-Design', 'Polestar Engineered', 'Recharge'] },
      { name: 'V90', yearStart: 2016, yearEnd: 2025, variants: ['Momentum', 'Inscription', 'R-Design', 'Cross Country', 'Polestar Engineered', 'Recharge'] },
      { name: 'XC40', yearStart: 2017, yearEnd: 2025, variants: ['Momentum', 'Inscription', 'R-Design', 'Recharge Pure Electric', 'Recharge T5', 'Ultimate'] },
      { name: 'XC60', yearStart: 2008, yearEnd: 2025, variants: ['Momentum', 'Inscription', 'R-Design', 'Polestar Engineered', 'Recharge T8', 'Ultimate'] },
      { name: 'XC90', yearStart: 2002, yearEnd: 2025, variants: ['Momentum', 'Inscription', 'R-Design', 'Excellence', 'Polestar Engineered', 'Recharge T8', 'Ultimate'] },
      { name: 'P1800', yearStart: 1961, yearEnd: 1973, variants: ['P1800', 'P1800S', 'P1800E', 'P1800ES'] },
      { name: '240', yearStart: 1974, yearEnd: 1993, variants: ['DL', 'GL', 'GLE', 'Turbo', 'Estate'] },
      { name: '850', yearStart: 1991, yearEnd: 1996, variants: ['Base', 'GLT', 'Turbo', 'T5', 'T5-R', 'Estate'] },
    ]
  },

  // ─── MOTORCYCLES ────────────────────────────────────────

  {
    id: 'aprilia',
    name: 'Aprilia',
    type: 'motorcycle',
    country: 'Italy',
    models: [
      { name: 'RSV4', yearStart: 2009, yearEnd: 2025, variants: ['Factory', 'R', 'RR', 'RF', '1100 Factory', '1100 RF', 'Factory Works', 'X Trenta'] },
      { name: 'RS 660', yearStart: 2020, yearEnd: 2025, variants: ['Base', 'Extrema', 'Trophy', 'Trofeo'] },
      { name: 'Tuono V4', yearStart: 2011, yearEnd: 2025, variants: ['R', 'APRC', 'RR', 'Factory', '1100', '1100 Factory', '1100 RR'] },
      { name: 'Tuono 660', yearStart: 2021, yearEnd: 2025, variants: ['Base', 'Factory', 'Pikes Peak'] },
      { name: 'Dorsoduro', yearStart: 2008, yearEnd: 2018, variants: ['750', '900', '1200'] },
      { name: 'Shiver', yearStart: 2007, yearEnd: 2021, variants: ['750', '900', 'GT', 'SL'] },
      { name: 'Pegaso', yearStart: 1992, yearEnd: 2011, variants: ['650', '650 i.e.', '650 Trail', 'Factory'] },
      { name: 'Mana', yearStart: 2007, yearEnd: 2016, variants: ['850', '850 GT', 'GT ABS'] },
      { name: 'RST 1000', yearStart: 2001, yearEnd: 2004, variants: ['Futura'] },
      { name: 'SXV / RXV', yearStart: 2006, yearEnd: 2012, variants: ['450', '550', '5.5'] },
    ]
  },

  {
    id: 'bmw_motorrad',
    name: 'BMW Motorrad',
    type: 'motorcycle',
    country: 'Germany',
    models: [
      { name: 'S 1000 RR', yearStart: 2009, yearEnd: 2025, variants: ['Base', 'Sport', 'Race', 'HP4', 'HP4 Race', 'M', 'M Competition'] },
      { name: 'S 1000 R', yearStart: 2013, yearEnd: 2025, variants: ['Base', 'Sport', 'Pro', 'M Sport', 'M Competition'] },
      { name: 'S 1000 XR', yearStart: 2015, yearEnd: 2025, variants: ['Base', 'Sport', 'Pro', 'M Sport'] },
      { name: 'R 1250 GS', yearStart: 2018, yearEnd: 2025, variants: ['Base', 'TE', 'HP', 'Adventure', 'Adventure TE', 'Adventure HP', 'Trophy', 'Triple Black', '40 Years GS'] },
      { name: 'R 1200 GS', yearStart: 2004, yearEnd: 2018, variants: ['Base', 'Adventure', 'TE', 'HP2', 'HP2 Enduro', 'HP2 Megamoto', 'Rallye'] },
      { name: 'M 1000 RR', yearStart: 2021, yearEnd: 2025, variants: ['Base', 'Competition', '50 Years M'] },
      { name: 'M 1000 R', yearStart: 2023, yearEnd: 2025, variants: ['Base', 'Competition'] },
      { name: 'R 18', yearStart: 2020, yearEnd: 2025, variants: ['Base', 'Classic', 'Bagger', 'Transcontinental', 'Roctane', 'B'] },
      { name: 'F 900 R', yearStart: 2020, yearEnd: 2025, variants: ['Base', 'Sport', 'M Sport'] },
      { name: 'F 900 XR', yearStart: 2020, yearEnd: 2025, variants: ['Base', 'Sport', 'M Sport'] },
      { name: 'G 310 R', yearStart: 2016, yearEnd: 2025, variants: ['Base'] },
      { name: 'G 310 GS', yearStart: 2017, yearEnd: 2025, variants: ['Base'] },
      { name: 'K 1600 GT', yearStart: 2011, yearEnd: 2025, variants: ['Base', 'GTL', 'Grand America'] },
      { name: 'CE 04', yearStart: 2021, yearEnd: 2025, variants: ['Base', 'Premium'] },
    ]
  },

  {
    id: 'ducati',
    name: 'Ducati',
    type: 'motorcycle',
    country: 'Italy',
    models: [
      { name: 'Panigale', yearStart: 2012, yearEnd: 2025, variants: ['899', '959', '959 Corse', '1199', '1199 S', '1199 R', '1299', '1299 S', '1299 R FE', 'V2', 'V2 S', 'V2 Bayliss', 'V4', 'V4 S', 'V4 R', 'V4 SP', 'V4 SP2', 'V4 Speciale'] },
      { name: 'Monster', yearStart: 1993, yearEnd: 2025, variants: ['620', '695', '696', '750', '796', '800', '821', '821 Stealth', '900', '900 S', '1000', '1100', '1100 S', 'S4R', 'S4RS', 'S2R', 'Plus', '+', 'SP', 'Stripe'] },
      { name: 'Streetfighter', yearStart: 2009, yearEnd: 2025, variants: ['848', 'S', 'V2', 'V4', 'V4 S', 'V4 SP', 'V4 SP2', 'V4 Lamborghini'] },
      { name: 'Multistrada', yearStart: 2003, yearEnd: 2025, variants: ['620', '1000', '1000 S', '1100', '1100 S', '1200', '1200 S', '1200 GT', '1260', '1260 S', '1260 Enduro', 'V2', 'V4', 'V4 S', 'V4 Rally', 'V4 Pikes Peak', 'V4 Grand Tour'] },
      { name: 'Scrambler', yearStart: 2015, yearEnd: 2025, variants: ['Icon', 'Icon Dark', 'Full Throttle', 'Cafe Racer', 'Desert Sled', 'Desert Sled Fasthouse', 'Nightshift', 'Urban Motard', 'Urban Enduro', '1100', '1100 Sport', '1100 PRO', 'Tribute PRO'] },
      { name: 'SuperSport', yearStart: 2017, yearEnd: 2025, variants: ['Base', 'S', '950', '950 S'] },
      { name: 'Hypermotard', yearStart: 2007, yearEnd: 2025, variants: ['796', '821', '821 SP', '939', '939 SP', '950', '950 SP', '950 RVE'] },
      { name: 'Diavel', yearStart: 2010, yearEnd: 2025, variants: ['Base', 'Carbon', 'AMG Special Edition', '1260', '1260 S', 'Lamborghini', 'V4', 'V4 S', 'V4 Black Steel'] },
      { name: 'XDiavel', yearStart: 2016, yearEnd: 2025, variants: ['Base', 'S', 'Dark', 'Black Star', 'Nera'] },
      { name: 'Superbike 916', yearStart: 1994, yearEnd: 1998, variants: ['916', '916 SP', '916 SPS', 'Fogarty Replica'] },
      { name: 'Superbike 996', yearStart: 1998, yearEnd: 2001, variants: ['996', '996 S', '996 SPS', '996 R', 'Bostrom Replica'] },
      { name: 'Superbike 998', yearStart: 2002, yearEnd: 2004, variants: ['998', '998 S', '998 R', 'Bayliss Replica', 'Matrix Edition'] },
      { name: 'Superbike 1098', yearStart: 2007, yearEnd: 2009, variants: ['1098', '1098 S', '1098 R', 'Troy Bayliss Replica'] },
      { name: 'Superbike 1198', yearStart: 2009, yearEnd: 2012, variants: ['1198', '1198 S', '1198 SP', '1198 R Corse Special Edition'] },
    ]
  },

  {
    id: 'harley_davidson',
    name: 'Harley-Davidson',
    type: 'motorcycle',
    country: 'USA',
    models: [
      { name: 'Sportster', yearStart: 1957, yearEnd: 2022, variants: ['883', '883 Custom', '883 Iron', '883 Low', '1200 Custom', '1200 Forty-Eight', '1200 Seventy-Two', '1200 Nightster', 'S', 'Iron 883', 'XL 1200X', 'XL 1200NS', 'XL 1200T Superlow'] },
      { name: 'Nightster', yearStart: 2022, yearEnd: 2025, variants: ['Base', 'Special', 'S'] },
      { name: 'Softail', yearStart: 1984, yearEnd: 2025, variants: ['Standard', 'Slim', 'Fat Boy', 'Fat Bob', 'Street Bob', 'Heritage Classic', 'Deluxe', 'Breakout', 'Low Rider', 'Low Rider S', 'Low Rider ST', 'Softail Springer'] },
      { name: 'Dyna', yearStart: 1991, yearEnd: 2017, variants: ['Street Bob', 'Low Rider', 'Fat Bob', 'Super Glide', 'Wide Glide', 'Switchback', 'CVO'] },
      { name: 'Touring', yearStart: 1980, yearEnd: 2025, variants: ['Road King', 'Road King Classic', 'Road King Special', 'Road Glide', 'Road Glide Special', 'Street Glide', 'Street Glide Special', 'Electra Glide', 'Electra Glide Ultra Classic', 'Ultra Limited', 'Tri Glide Ultra'] },
      { name: 'CVO', yearStart: 2001, yearEnd: 2025, variants: ['Road Glide', 'Street Glide', 'Ultra Limited', 'Softail Breakout', 'Pro Street Breakout', 'Electra Glide Ultra Classic', 'Limited'] },
      { name: 'Pan America', yearStart: 2021, yearEnd: 2025, variants: ['1250', '1250 Special', 'S'] },
      { name: 'LiveWire', yearStart: 2019, yearEnd: 2025, variants: ['Base', 'One', 'Del Mar', 'S2 Mulholland'] },
      { name: 'VRSC', yearStart: 2001, yearEnd: 2017, variants: ['V-Rod', 'V-Rod Muscle', 'Night Rod', 'Night Rod Special', 'Street Rod'] },
    ]
  },

  {
    id: 'honda_moto',
    name: 'Honda',
    type: 'motorcycle',
    country: 'Japan',
    models: [
      { name: 'CBR1000RR', yearStart: 2004, yearEnd: 2025, variants: ['Base', 'ABS', 'SP', 'SP2', 'Fireblade', 'Fireblade SP', 'Fireblade SP2', 'R'] },
      { name: 'CBR600RR', yearStart: 2003, yearEnd: 2024, variants: ['Base', 'ABS', 'C-ABS', 'Repsol Edition'] },
      { name: 'CB1000R', yearStart: 2008, yearEnd: 2025, variants: ['Base', 'ABS', 'SC80', 'Plus', 'Black Edition'] },
      { name: 'CB650R', yearStart: 2019, yearEnd: 2025, variants: ['Base', 'E Clutch'] },
      { name: 'CB500F', yearStart: 2013, yearEnd: 2025, variants: ['Base', 'ABS'] },
      { name: 'CB500X', yearStart: 2013, yearEnd: 2025, variants: ['Base', 'ABS'] },
      { name: 'Africa Twin', yearStart: 1988, yearEnd: 2025, variants: ['RD04', 'RD07', '1000L', '1000L DCT', '1100L', '1100L DCT', 'Adventure Sports', 'Adventure Sports DCT', 'ES DCT'] },
      { name: 'Gold Wing', yearStart: 1974, yearEnd: 2025, variants: ['GL1000', 'GL1100', 'GL1200', 'GL1500', 'GL1800', 'GL1800 DCT', 'Tour', 'Tour DCT', 'Tour Airbag DCT'] },
      { name: 'CB750', yearStart: 1969, yearEnd: 2025, variants: ['K0', 'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'F', 'F2', 'Nighthawk', 'Hornet'] },
      { name: 'CB400 Super Four', yearStart: 1992, yearEnd: 2013, variants: ['Version S', 'Version R', 'Hyper VTEC', 'Hyper VTEC Spec 2', 'Revo'] },
      { name: 'CBR400RR', yearStart: 1988, yearEnd: 1999, variants: ['NC23', 'NC29', 'Gull Arm'] },
      { name: 'VFR800', yearStart: 1997, yearEnd: 2021, variants: ['Fi', 'VTEC', 'ABS', 'F', 'Interceptor'] },
      { name: 'RC213V-S', yearStart: 2015, yearEnd: 2016, variants: ['Base', 'Sport Kit'] },
      { name: 'NSR250R', yearStart: 1987, yearEnd: 1999, variants: ['MC16', 'MC18', 'MC21', 'MC28', 'SE', 'Special Edition'] },
    ]
  },

  {
    id: 'kawasaki',
    name: 'Kawasaki',
    type: 'motorcycle',
    country: 'Japan',
    models: [
      { name: 'Ninja ZX-10R', yearStart: 2004, yearEnd: 2025, variants: ['Base', 'ABS', 'SE', 'RR', 'KRT Edition', 'Winter Test Edition'] },
      { name: 'Ninja ZX-6R', yearStart: 1995, yearEnd: 2025, variants: ['Base', 'ABS', 'KRT Edition', '636', '636 ABS', 'ZX636F', 'ZX636G'] },
      { name: 'Ninja H2', yearStart: 2015, yearEnd: 2025, variants: ['H2', 'H2R', 'H2 SX', 'H2 SX SE', 'H2 Carbon', 'H2 SX SE+'] },
      { name: 'Z1000', yearStart: 2003, yearEnd: 2021, variants: ['Base', 'ABS', 'SX', 'SX ABS', 'R Performance'] },
      { name: 'Z900', yearStart: 2017, yearEnd: 2025, variants: ['Base', 'ABS', 'RS', 'RS Cafe', 'SE', 'Performance'] },
      { name: 'Z650', yearStart: 2017, yearEnd: 2025, variants: ['Base', 'ABS', 'RS'] },
      { name: 'Versys 1000', yearStart: 2012, yearEnd: 2025, variants: ['Base', 'ABS', 'SE', 'SE+'] },
      { name: 'Versys 650', yearStart: 2006, yearEnd: 2025, variants: ['Base', 'ABS', 'Grand Tourer'] },
      { name: 'W800', yearStart: 2010, yearEnd: 2025, variants: ['Base', 'Cafe', 'Street'] },
      { name: 'Z1 900', yearStart: 1972, yearEnd: 1977, variants: ['Z1', 'Z1-A', 'Z1-B', 'Z900', 'Z900-A4'] },
      { name: 'GPZ 900R', yearStart: 1984, yearEnd: 2003, variants: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'US Spec'] },
      { name: 'KX', yearStart: 1974, yearEnd: 2025, variants: ['65', '85', '100', '112', '250', '250F', '450', '450F', '450SR', '450X'] },
    ]
  },

  {
    id: 'ktm',
    name: 'KTM',
    type: 'motorcycle',
    country: 'Austria',
    models: [
      { name: '1290 Super Duke R', yearStart: 2014, yearEnd: 2025, variants: ['Base', 'EVO', 'RR'] },
      { name: '1290 Super Adventure', yearStart: 2015, yearEnd: 2025, variants: ['S', 'R', 'X'] },
      { name: '890 Duke R', yearStart: 2020, yearEnd: 2025, variants: ['Base', 'GP Edition'] },
      { name: '890 Adventure', yearStart: 2021, yearEnd: 2025, variants: ['Base', 'R', 'Rally', 'L'] },
      { name: 'RC 390', yearStart: 2014, yearEnd: 2025, variants: ['Base', 'Cup Edition', 'R'] },
      { name: '390 Duke', yearStart: 2013, yearEnd: 2025, variants: ['Base', 'GP Edition'] },
      { name: '690 Duke', yearStart: 2008, yearEnd: 2025, variants: ['Base', 'R', 'L'] },
      { name: 'RC8', yearStart: 2008, yearEnd: 2016, variants: ['Base', 'R', 'Track'] },
      { name: 'EXC', yearStart: 1990, yearEnd: 2025, variants: ['125', '150', '200', '250', '300', '350', '450', '500', 'TPI', 'TPI Erzbergrodeo', 'Factory Edition'] },
      { name: '450 Rally', yearStart: 2011, yearEnd: 2025, variants: ['Factory', 'Replica'] },
    ]
  },

  {
    id: 'moto_guzzi',
    name: 'Moto Guzzi',
    type: 'motorcycle',
    country: 'Italy',
    models: [
      { name: 'V7', yearStart: 1967, yearEnd: 2025, variants: ['V7 I', 'V7 II', 'V7 III', 'V7 Classic', 'V7 Special', 'V7 Racer', 'V7 Stone', 'V7 Stone Night Pack', 'V7 Anniversary', 'Centenario'] },
      { name: 'V9', yearStart: 2016, yearEnd: 2025, variants: ['Bobber', 'Roamer', 'Bobber Sport'] },
      { name: 'V100 Mandello', yearStart: 2022, yearEnd: 2025, variants: ['Base', 'S'] },
      { name: 'V85 TT', yearStart: 2019, yearEnd: 2025, variants: ['Base', 'Travel', 'Adventure'] },
      { name: 'California', yearStart: 1971, yearEnd: 2016, variants: ['1400', '1400 Custom', '1400 Touring', '1400 Eldorado', 'Custom', 'Touring', 'Vintage'] },
      { name: 'Le Mans', yearStart: 1976, yearEnd: 1993, variants: ['850 Le Mans', '850 Le Mans II', '850 Le Mans III', '1000 Le Mans IV', '1000 Le Mans V'] },
      { name: 'Griso', yearStart: 2005, yearEnd: 2016, variants: ['850', '1100', '1200 8V'] },
    ]
  },

  {
    id: 'mv_agusta',
    name: 'MV Agusta',
    type: 'motorcycle',
    country: 'Italy',
    models: [
      { name: 'F4', yearStart: 1999, yearEnd: 2019, variants: ['750 S', '750 S Serie Oro', '1000', '1000 S', '1000 Tamburini', '1000 R', 'RR', '1000 Senna', '1000 Claudio', 'RC', 'RC 20th Anniversary'] },
      { name: 'F3', yearStart: 2012, yearEnd: 2023, variants: ['675', '675 RC', '800', '800 AGO', '800 RC', '800 RR', '800 Rosso', 'Serie Oro'] },
      { name: 'Brutale', yearStart: 2001, yearEnd: 2025, variants: ['750', '910', '920', '989', '990R', '1078RR', '675', '800', '800 RR', '1090RR', 'Dragster', 'Dragster RR', 'Dragster 800 RC', '1000 RR', 'Serie Oro'] },
      { name: 'Turismo Veloce', yearStart: 2015, yearEnd: 2025, variants: ['800', '800 Lusso', '800 RC', '800 Rosso', '800 Gold'] },
      { name: 'Superveloce', yearStart: 2019, yearEnd: 2025, variants: ['800', '800 S', '800 Serie Oro', 'Alpine'] },
      { name: 'Rush', yearStart: 2020, yearEnd: 2025, variants: ['1000', 'RR'] },
    ]
  },

  {
    id: 'norton',
    name: 'Norton',
    type: 'motorcycle',
    country: 'UK',
    models: [
      { name: 'Commando', yearStart: 1967, yearEnd: 2025, variants: ['750', '850', 'Fastback', 'Roadster', 'Interstate', 'Hi Rider', 'Combat', 'John Player Replica', 'Cafe Racer', '961 Sport', '961 SE', '961 Cafe Racer', '961 Commando'] },
      { name: 'V4CR', yearStart: 2023, yearEnd: 2025, variants: ['Base'] },
      { name: 'V4SV', yearStart: 2023, yearEnd: 2025, variants: ['Base'] },
      { name: 'Dominator', yearStart: 1949, yearEnd: 1968, variants: ['88', '99', 'Wideline', 'Slimline', 'SS', 'N15CS', 'Manxman'] },
      { name: 'Atlas', yearStart: 1962, yearEnd: 1968, variants: ['Base'] },
      { name: 'Manx', yearStart: 1950, yearEnd: 1962, variants: ['350', '500', '30M', '40M'] },
    ]
  },

  {
    id: 'royal_enfield',
    name: 'Royal Enfield',
    type: 'motorcycle',
    country: 'India/UK',
    models: [
      { name: 'Meteor 350', yearStart: 2020, yearEnd: 2025, variants: ['Fireball', 'Stellar', 'Supernova'] },
      { name: 'Classic 350', yearStart: 2009, yearEnd: 2025, variants: ['Single Channel ABS', 'Dual Channel ABS', 'Halcyon Black', 'Halcyon Green', 'Dark', 'Signals'] },
      { name: 'Bullet 350', yearStart: 1955, yearEnd: 2025, variants: ['ES', 'Standard', 'Military', 'Classic', 'Chrome', 'Trials'] },
      { name: 'Himalayan', yearStart: 2016, yearEnd: 2025, variants: ['Base', 'A', 'B', 'Rock Red', 'Granite Black', '450'] },
      { name: 'Interceptor 650', yearStart: 2018, yearEnd: 2025, variants: ['Base', 'Orange Crush', 'Baker Express', 'Ventura Blue', 'Ravishing Red', 'Mark 2', 'Chrome'] },
      { name: 'Continental GT 650', yearStart: 2018, yearEnd: 2025, variants: ['Base', 'Ice Queen', 'Rocker Red', 'Slipstream Blue', 'Dux Deluxe', 'Chrome', 'Mark 2'] },
      { name: 'Super Meteor 650', yearStart: 2023, yearEnd: 2025, variants: ['Base', 'Celestial', 'Interstellar Grey', 'Astral Black'] },
      { name: 'Shotgun 650', yearStart: 2024, yearEnd: 2025, variants: ['Base', 'Matte Barrelled Black', 'Chrome Red'] },
    ]
  },

  {
    id: 'suzuki_moto',
    name: 'Suzuki',
    type: 'motorcycle',
    country: 'Japan',
    models: [
      { name: 'GSX-R1000', yearStart: 2001, yearEnd: 2025, variants: ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8', 'K9', 'L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'R', 'RX', 'L8 R'] },
      { name: 'GSX-R750', yearStart: 1985, yearEnd: 2017, variants: ['W', 'X', 'Y', 'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8', 'K9', 'L0', 'L1'] },
      { name: 'GSX-R600', yearStart: 1992, yearEnd: 2022, variants: ['W', 'X', 'Y', 'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8', 'K9', 'L0', 'L1'] },
      { name: 'Hayabusa', yearStart: 1999, yearEnd: 2025, variants: ['Gen 1', 'Gen 2', 'Gen 3', 'WVA1', 'EX', 'Limited Edition', 'Anniversary Edition'] },
      { name: 'GSX-S1000', yearStart: 2015, yearEnd: 2025, variants: ['Base', 'F', 'GT', 'A', 'GX'] },
      { name: 'SV650', yearStart: 1999, yearEnd: 2025, variants: ['Base', 'S', 'A', 'ABS', 'MotoGP Edition'] },
      { name: 'V-Strom 1050', yearStart: 2020, yearEnd: 2025, variants: ['Base', 'XT', 'DE'] },
      { name: 'V-Strom 650', yearStart: 2004, yearEnd: 2025, variants: ['Base', 'XT', 'ABS', 'Adventure'] },
      { name: 'Katana', yearStart: 1981, yearEnd: 2025, variants: ['GSX1100S', 'GSX750S', 'GSX400S', '2019 Base', 'Katana 3.0'] },
      { name: 'Bandit', yearStart: 1989, yearEnd: 2015, variants: ['400', '600', '600S', '600F', '650', '650S', '1200', '1200S', '1250', '1250S', '1250F'] },
      { name: 'DR-Z400', yearStart: 2000, yearEnd: 2025, variants: ['S', 'SM', 'E'] },
    ]
  },

  {
    id: 'triumph',
    name: 'Triumph',
    type: 'motorcycle',
    country: 'UK',
    models: [
      { name: 'Bonneville', yearStart: 1959, yearEnd: 2025, variants: ['T100', 'T120', 'T100 Black', 'T120 Black', 'SE', 'SE T100', 'Chrome Edition', 'Gold Line', '60th Anniversary', 'Speedmaster', 'Bobber', 'Bobber Black', 'Bobber TFC'] },
      { name: 'Speed Twin', yearStart: 2019, yearEnd: 2025, variants: ['900', '1200', '1200 RS', 'Chrome Edition'] },
      { name: 'Thruxton', yearStart: 2004, yearEnd: 2025, variants: ['900', '1200', '1200 R', 'TFC', 'Ace', 'RS', 'Chrome Edition'] },
      { name: 'Street Twin', yearStart: 2015, yearEnd: 2025, variants: ['Base', 'Gold Line'] },
      { name: 'Street Scrambler', yearStart: 2017, yearEnd: 2025, variants: ['Base', 'Chrome Edition'] },
      { name: 'Scrambler 1200', yearStart: 2019, yearEnd: 2025, variants: ['XC', 'XE', 'Bond Edition', 'Steve McQueen Edition'] },
      { name: 'Tiger', yearStart: 1993, yearEnd: 2025, variants: ['900', '900 Rally', '900 GT', '900 GT Pro', '900 Rally Pro', '1200', '1200 XR', '1200 XCA', '1200 XCX', '1200 Alpine Edition', '1200 XRT'] },
      { name: 'Speed Triple', yearStart: 1994, yearEnd: 2025, variants: ['885i', '955i', '1050', '1050 R', '1050 S', '1050 SE', '1200 RS', '1200 RR', '1200 RR Moto2 Edition'] },
      { name: 'Daytona', yearStart: 1992, yearEnd: 2025, variants: ['750', '900', '1000', '1200', 'T595', '955i', '675', '675 SE', '675R', '675 Moto2 LE', '660', 'Moto2 765', '765 Moto2 Limited Edition'] },
      { name: 'Rocket III', yearStart: 2004, yearEnd: 2025, variants: ['Classic', 'Touring', 'Roadster', 'TFC', 'R', 'GT', 'Storm'] },
      { name: 'Tiger 660', yearStart: 2021, yearEnd: 2025, variants: ['Base', 'Sport'] },
      { name: 'Trident 660', yearStart: 2021, yearEnd: 2025, variants: ['Base', 'Chrome Edition'] },
    ]
  },

  {
    id: 'yamaha_moto',
    name: 'Yamaha',
    type: 'motorcycle',
    country: 'Japan',
    models: [
      { name: 'YZF-R1', yearStart: 1998, yearEnd: 2025, variants: ['Base', 'M', 'S', 'SP', 'GYTR', 'LE', 'R1M', '60th Anniversary', 'World GP 60th Anniversary', 'Icon', 'Race Blue'] },
      { name: 'YZF-R6', yearStart: 1999, yearEnd: 2023, variants: ['Base', 'S', 'R', 'SP', 'Race', '60th Anniversary', 'World GP 60th Anniversary'] },
      { name: 'YZF-R7', yearStart: 2021, yearEnd: 2025, variants: ['Base', 'Icon Blue', 'Icon Black'] },
      { name: 'MT-10', yearStart: 2016, yearEnd: 2025, variants: ['Base', 'SP', 'Tourer Edition', 'Anniversary Edition'] },
      { name: 'MT-09', yearStart: 2013, yearEnd: 2025, variants: ['Base', 'SP', 'Tracer', 'Tracer GT', 'Tracer GT+'] },
      { name: 'MT-07', yearStart: 2014, yearEnd: 2025, variants: ['Base', 'Tracer', 'Tracer GT'] },
      { name: 'NMAX 125', yearStart: 2015, yearEnd: 2025, variants: ['Base', 'Connected', 'Tech Max'] },
      { name: 'T-MAX', yearStart: 2001, yearEnd: 2025, variants: ['500', '530', '530 SX', '530 DX', '560', '560 Tech Max', '560 Sport Max'] },
      { name: 'Ténéré 700', yearStart: 2019, yearEnd: 2025, variants: ['Base', 'Rally', 'World Raid', 'Explorer', 'Extreme'] },
      { name: 'XSR900', yearStart: 2016, yearEnd: 2025, variants: ['Base', 'GP'] },
      { name: 'XSR700', yearStart: 2016, yearEnd: 2025, variants: ['Base', 'Xtribute'] },
      { name: 'VMAX', yearStart: 1985, yearEnd: 2020, variants: ['1200 V4', '1700 V4', 'Carbon Edition'] },
      { name: 'V-Max', yearStart: 1985, yearEnd: 1992, variants: ['1200 Original'] },
      { name: 'RD350', yearStart: 1973, yearEnd: 1980, variants: ['Base', 'LC', 'YPVS'] },
      { name: 'RZV500R', yearStart: 1984, yearEnd: 1987, variants: ['Base'] },
    ]
  },

  {
    id: 'zero',
    name: 'Zero Motorcycles',
    type: 'motorcycle',
    country: 'USA',
    models: [
      { name: 'SR/F', yearStart: 2019, yearEnd: 2025, variants: ['Base', 'Premium'] },
      { name: 'SR/S', yearStart: 2020, yearEnd: 2025, variants: ['Base', 'Premium'] },
      { name: 'SR', yearStart: 2012, yearEnd: 2025, variants: ['Base', 'ZF12.5', 'ZF14.4'] },
      { name: 'S', yearStart: 2010, yearEnd: 2025, variants: ['Base', 'ZF12.5', 'ZF14.4'] },
      { name: 'DS', yearStart: 2010, yearEnd: 2025, variants: ['Base', 'ZF12.5', 'ZF14.4'] },
      { name: 'DSR', yearStart: 2014, yearEnd: 2025, variants: ['Base', 'ZF14.4', 'Black Forest'] },
      { name: 'FX', yearStart: 2012, yearEnd: 2025, variants: ['Base', 'ZF7.2', 'ZF3.6'] },
      { name: 'FXE', yearStart: 2021, yearEnd: 2025, variants: ['Base'] },
    ]
  },

  // ─── CLASSIC & SPECIALIST ──────────────────────────────

  {
    id: 'ac',
    name: 'AC Cars',
    type: 'car',
    country: 'UK',
    models: [
      { name: 'Cobra', yearStart: 1962, yearEnd: 2025, variants: ['260', '289', '427', 'MkII', 'MkIII', 'MkIV', 'Superblower', 'Superblower MkIV', '212', 'GT Coupe'] },
      { name: 'Ace', yearStart: 1954, yearEnd: 1963, variants: ['Bristol', 'Ford', '2.0L', 'Ruddspeed'] },
      { name: 'Aceca', yearStart: 1954, yearEnd: 1963, variants: ['Bristol', 'Ford'] },
    ]
  },

  {
    id: 'bsa',
    name: 'BSA',
    type: 'motorcycle',
    country: 'UK',
    models: [
      { name: 'Gold Star', yearStart: 1938, yearEnd: 1963, variants: ['350', '500', 'Clubmans', 'DBD34', 'DBD32'] },
      { name: 'A65', yearStart: 1962, yearEnd: 1973, variants: ['Lightning', 'Thunderbolt', 'Spitfire', 'Hornet', 'Firebird Scrambler'] },
      { name: 'A10', yearStart: 1950, yearEnd: 1963, variants: ['Golden Flash', 'Road Rocket', 'Super Rocket', 'Rocket Gold Star', 'Spitfire Scrambler'] },
      { name: 'Bantam', yearStart: 1948, yearEnd: 1971, variants: ['D1', 'D3', 'D5', 'D7', 'D10', 'D14'] },
      { name: 'B50', yearStart: 1971, yearEnd: 1973, variants: ['SS', 'T', 'MX'] },
      { name: 'Gold Star 650', yearStart: 2021, yearEnd: 2025, variants: ['Base'] },
    ]
  },

  {
    id: 'ginetta',
    name: 'Ginetta',
    type: 'car',
    country: 'UK',
    models: [
      { name: 'G40', yearStart: 2007, yearEnd: 2020, variants: ['Junior', 'GT5', 'GT5 S'] },
      { name: 'G55', yearStart: 2012, yearEnd: 2020, variants: ['GT4', 'Supercup'] },
      { name: 'G56', yearStart: 2017, yearEnd: 2022, variants: ['GT4', 'GTA'] },
      { name: 'G57', yearStart: 2019, yearEnd: 2025, variants: ['GT4'] },
      { name: 'G60', yearStart: 2018, yearEnd: 2025, variants: ['GT4'] },
      { name: 'G4', yearStart: 1961, yearEnd: 1969, variants: ['Mk1', 'Mk2', 'Mk3'] },
    ]
  },

  {
    id: 'westfield',
    name: 'Westfield',
    type: 'car',
    country: 'UK',
    models: [
      { name: 'SEi', yearStart: 1982, yearEnd: 2025, variants: ['Ford Kent', 'Ford Zetec', '2.0 Zetec', 'Turbo'] },
      { name: 'Sport 250', yearStart: 2007, yearEnd: 2025, variants: ['Base', 'Race'] },
      { name: 'Sport 2000', yearStart: 2001, yearEnd: 2025, variants: ['Base', 'Race', 'R'] },
      { name: 'Megabusa', yearStart: 2000, yearEnd: 2018, variants: ['Base', 'Turbo'] },
      { name: 'iRacer', yearStart: 2013, yearEnd: 2020, variants: ['Base'] },
    ]
  },

]

// Helper functions

export function getMakesByType(type: 'car' | 'motorcycle' | 'all'): VehicleMake[] {
  if (type === 'all') return VEHICLE_DATABASE
  if (type === 'motorcycle') return VEHICLE_DATABASE.filter(m => m.type === 'motorcycle')
  return VEHICLE_DATABASE.filter(m => m.type === 'car' || m.type === 'both')
}

export function getMakeById(id: string): VehicleMake | undefined {
  return VEHICLE_DATABASE.find(m => m.id === id)
}

export function getModelsByMake(makeId: string): VehicleModel[] {
  return getMakeById(makeId)?.models || []
}

export function getModelByName(makeId: string, modelName: string): VehicleModel | undefined {
  return getModelsByMake(makeId).find(m => m.name === modelName)
}

export function getVariantsByModel(makeId: string, modelName: string): string[] {
  return getModelByName(makeId, modelName)?.variants || []
}

export function getYearsByModel(makeId: string, modelName: string): number[] {
  const model = getModelByName(makeId, modelName)
  if (!model) return []
  const years: number[] = []
  for (let y = model.yearEnd; y >= model.yearStart; y--) {
    years.push(y)
  }
  return years
}

export function searchMakes(query: string, type: 'car' | 'motorcycle' | 'all' = 'all'): VehicleMake[] {
  const makes = getMakesByType(type)
  const q = query.toLowerCase().trim()
  return makes.filter(m => m.name.toLowerCase().includes(q))
}

export function searchModels(makeId: string, query: string): VehicleModel[] {
  const models = getModelsByMake(makeId)
  const q = query.toLowerCase().trim()
  return models.filter(m => m.name.toLowerCase().includes(q))
}
