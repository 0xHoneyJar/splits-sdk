import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'
import {
  Control,
  FieldValues,
  Path,
  UseFormSetError,
  UseFormSetValue,
  useWatch,
} from 'react-hook-form'

import AddressInput from './AddressInput'
import SelectInput from './SelectInput'

const AddressSelectInput = <FormType extends FieldValues>({
  control,
  inputName,
  options,
  emptyText,
  setValue,
  setError,
  validationFunc,
  validAddressDisplay,
  clearAddressDefaultValue = '',
  isDisabled = false,
  supportsEns,
}: {
  control: Control<FormType>
  inputName: Path<FormType>
  options: {
    value: string
    display: () => JSX.Element
  }[]
  emptyText: string
  setValue: UseFormSetValue<FormType>
  setError: UseFormSetError<FormType>
  validationFunc: (
    address: string,
  ) => (boolean | string) | Promise<boolean | string>
  validAddressDisplay?: (address: string) => JSX.Element
  clearAddressDefaultValue?: string
  isDisabled?: boolean
  supportsEns: boolean
}): JSX.Element => {
  const inputVal = useWatch({
    control,
    name: inputName,
  })

  const currentValInList =
    options.filter((option) => option.value === inputVal).length > 0
  const defaultInputBox = !currentValInList && inputVal
  const [selectedAddress, setSelectedAddress] = useState(
    defaultInputBox ? 'address' : inputVal,
  )

  useEffect(() => {
    if (selectedAddress === 'address') return
    if (selectedAddress !== inputVal) {
      const currentValInList =
        options.filter((option) => option.value === inputVal).length > 0
      if (currentValInList) setSelectedAddress(inputVal)
      else setSelectedAddress('address')
    }
  }, [options, inputVal, selectedAddress])

  const clearAddress = () => {
    setSelectedAddress(clearAddressDefaultValue)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typedAddress = clearAddressDefaultValue as any
    setValue(inputName, typedAddress)
  }

  const selectAddress = (value: string) => {
    setSelectedAddress(value)

    const valueToSet = value === 'address' ? '' : value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const typedAddress = valueToSet as any
    setValue(inputName, typedAddress)
  }

  if (selectedAddress === 'address')
    return (
      <AddressInput
        control={control}
        inputName={inputName}
        setValue={setValue}
        setError={setError}
        placeholder={'Enter address'}
        validationFunc={validationFunc}
        onClearInput={clearAddress}
        autoFocus
        validAddressDisplay={validAddressDisplay}
        supportsEns={supportsEns}
      />
    )

  return (
    <SelectInput
      selectedOption={selectedAddress}
      emptyText={emptyText}
      options={options.concat([
        {
          value: 'address',
          display: () => (
            <div className="flex items-center space-x-2">
              <MagnifyingGlassIcon className="mx-0.5 h-4 w-4" />
              <div>Enter address</div>
            </div>
          ),
        },
      ])}
      selectValue={selectAddress}
      isDisabled={isDisabled}
    />
  )
}

export default AddressSelectInput
