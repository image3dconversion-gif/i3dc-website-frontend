export const PROFESSIONAL_ROLES = {
  dentist: "Dentist / Dental Surgeon",
  specialist: "Dental Specialist",
  omfs: "Oral & Maxillofacial Surgeon",
  other_clinical: "Other Clinical Professional",
  lab_technician: "Dental Lab / Technician",
  practice_staff: "Practice Staff / Coordinator",
  student: "Student / Trainee",
  industry_representative: "Dental Industry / Company Representative",
  other: "Other",
} as const;

export const ORGANISATION_TYPES = {
  clinic: "Dental Clinic / Practice",
  hospital: "Hospital",
  institution: "Institution / University",
  laboratory: "Dental Laboratory",
  implant_device: "Implant / Device Company",
  technology: "Dental Software / Technology Company",
  vendor: "Distributor / Vendor",
  other: "Other / Unsure",
} as const;

// Assigned ISO 3166-1 alpha-2 codes. Excludes reserved/user-assigned codes.
export const COUNTRY_CODES = (
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ " +
  "CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR " +
  "GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP " +
  "KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT " +
  "MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW " +
  "SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG " +
  "UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW"
).split(" ");

const countries = new Set(COUNTRY_CODES);

export function optionLabel<T extends Record<string, string>>(options: T, code: unknown): T[keyof T] | undefined {
  return typeof code === "string" && Object.hasOwn(options, code) ? options[code as keyof T] : undefined;
}

export function normalizeCountry(value: unknown): string | undefined {
  if (typeof value !== "string" || !/^[a-z]{2}$/i.test(value.trim())) return;
  const code = value.trim().toUpperCase();
  return countries.has(code) ? code : undefined;
}
