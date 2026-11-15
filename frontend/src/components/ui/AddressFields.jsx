import { useEffect, useMemo, useState } from 'react'
import { Input, Select } from './Form'
import { INDIAN_STATES_AND_UTS } from '@/data/indiaStates'
import { districtsForState } from '@/data/indiaDistricts'
import { areasOfDistrict, pincodeDetails } from '@/services/postalApi'

/**
 * State → District → Area → PIN, for every address form in the store.
 *
 * Used by checkout and the account address book, so the cascade is written
 * once. The rules it holds:
 *
 *  • **State** — all 28 states and 8 union territories, bundled.
 *  • **District** — repopulated from the chosen state, also bundled, so the
 *    cascade works with no network at all. A state we have no list for (or a
 *    saved address whose district is not in the list) degrades to a typed
 *    input rather than trapping the shopper with a blank dropdown.
 *  • **Area + PIN** — suggestions come live from the Postal Indexes API and
 *    cross-fill each other (pick an area, the PIN lands; type a PIN, the
 *    state/district/area fill in). Every one of them stays a plain editable
 *    field: an autofill is a convenience, never a lock.
 *
 * `value` carries `{ state, district, area, city, pincode }`; `onChange`
 * receives a patch object, so the owning form keeps its own draft shape.
 */
export function AddressFields({ value, onChange, errors = {} }) {
  const [districts, setDistricts] = useState(() => districtsForState(value.state))
  const [areaOptions, setAreaOptions] = useState([])
  const [loadingAreas, setLoadingAreas] = useState(false)

  const hasDistrictList = districts.length > 0

  // The Area box doubles as a free-text field, so suggestions are filtered
  // against what has been typed rather than swapped for a select.
  const areaSuggestions = useMemo(() => {
    const typed = String(value.area ?? '').trim().toLowerCase()
    if (!typed || areaOptions.length <= 1) return areaOptions
    const matched = areaOptions.filter((area) => area.name.toLowerCase().includes(typed))
    return matched.length ? matched : areaOptions
  }, [areaOptions, value.area])

  /* Districts follow the state. A saved address edited onto a new state keeps
     its district only when the new state actually has one. */
  useEffect(() => {
    const list = districtsForState(value.state)
    setDistricts(list)
    setAreaOptions([])
    if (list.length && value.district && !list.includes(value.district)) {
      onChange({ district: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on state change
  }, [value.state])

  /* Areas (and their PINs) follow the district. */
  useEffect(() => {
    const district = String(value.district ?? '').trim()
    if (!district) {
      setAreaOptions([])
      return
    }
    let cancelled = false
    setLoadingAreas(true)
    areasOfDistrict(district).then((areas) => {
      if (!cancelled) {
        setAreaOptions(areas)
        setLoadingAreas(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [value.district])

  const changeState = (state) => {
    const patch = { state }
    const list = districtsForState(state)
    if (list.length && !list.includes(value.district)) patch.district = ''
    onChange(patch)
  }

  const changeDistrict = (district) => {
    onChange({ district, area: '', pincode: '' })
    // A district we know nothing about still deserves its suggestions once
    // typed — the effect above refires on the value change.
  }

  /** Typing/choosing an area pulls its PIN (and the city) along with it. */
  const changeArea = (area) => {
    const patch = { area }
    const match = areaOptions.find((entry) => entry.name.toLowerCase() === area.trim().toLowerCase())
    if (match) {
      patch.pincode = match.pinCode
      if (!value.city) patch.city = match.name
    }
    onChange(patch)
  }

  /** A typed PIN back-fills state / district / area when the API knows it. */
  const blurPincode = async () => {
    const pin = String(value.pincode ?? '').trim()
    if (!/^\d{6}$/.test(pin)) return
    const details = await pincodeDetails(pin)
    if (!details) return
    const patch = {}
    if (details.state && !INDIAN_STATES_AND_UTS.includes(value.state)) patch.state = details.state
    if (details.district && !value.district) patch.district = details.district
    if (details.areas?.length && !value.area) patch.area = details.areas[0]
    if (Object.keys(patch).length) onChange(patch)
  }

  // A saved district that is not in the bundled list still has to render.
  const districtOptions = useMemo(() => {
    if (!value.district || districts.includes(value.district)) return districts
    return [value.district, ...districts]
  }, [districts, value.district])

  return (
    <>
      <Select
        label="State"
        required
        placeholder="Select state"
        options={INDIAN_STATES_AND_UTS}
        value={value.state ?? ''}
        error={errors.state}
        onChange={(event) => changeState(event.target.value)}
      />

      {hasDistrictList ? (
        <Select
          label="District"
          required
          placeholder="Select district"
          options={districtOptions}
          value={value.district ?? ''}
          error={errors.district}
          onChange={(event) => changeDistrict(event.target.value)}
        />
      ) : (
        <Input
          label="District"
          required
          placeholder={value.state ? 'Type the district' : 'Pick a state first'}
          value={value.district ?? ''}
          error={errors.district}
          onChange={(event) => changeDistrict(event.target.value)}
        />
      )}

      <Input
        label="Area / Locality"
        list="rehman-area-suggestions"
        placeholder={value.district ? (loadingAreas ? 'Loading areas…' : 'Start typing an area') : 'Pick a district first'}
        value={value.area ?? ''}
        error={errors.area}
        hint={areaOptions.length ? 'Choosing a listed area fills the PIN code below.' : undefined}
        onChange={(event) => changeArea(event.target.value)}
      />
      <datalist id="rehman-area-suggestions">
        {areaSuggestions.map((area) => (
          <option key={`${area.name}-${area.pinCode}`} value={area.name}>
            {area.pinCode}
          </option>
        ))}
      </datalist>

      <Input
        label="City / Taluka"
        required
        value={value.city ?? ''}
        error={errors.city}
        onChange={(event) => onChange({ city: event.target.value })}
      />

      <Input
        label="PIN code"
        required
        inputMode="numeric"
        maxLength={6}
        value={value.pincode ?? ''}
        error={errors.pincode}
        hint="Auto-fills with the area — type it and the address fills back."
        onChange={(event) => onChange({ pincode: event.target.value.replace(/\D/g, '').slice(0, 6) })}
        onBlur={blurPincode}
      />
    </>
  )
}

export default AddressFields
