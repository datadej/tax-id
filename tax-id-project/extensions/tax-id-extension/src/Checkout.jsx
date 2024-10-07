import {
  reactExtension,
  BlockStack,
  Text,
  TextField,
  useApi,
  useApplyAttributeChange,
  useBuyerJourneyIntercept,
  useTranslate,
} from "@shopify/ui-extensions-react/checkout";
import { useState } from "react";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.delivery-address.render-after", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();  // Use translate hook for translations
  const { extension } = useApi();
  
  const applyAttributeChange = useApplyAttributeChange();  // For updating order attributes

  // Declare state variables
  const [taxID, setTaxID] = useState("");
  const [error, setError] = useState(false);
  const [touched, setTouched] = useState(false);  // Track if the field has been touched

  // Block the checkout if validation fails
  useBuyerJourneyIntercept(() => {
    if (!validateTaxId(taxID)) {
      return {
        behavior: "block",
        reason: "Invalid Tax ID.",
        perform: () => showValidationUI(),
      };
    } else {
      setError(false);
      return {
        behavior: "allow",
      };
    }
  });

  const showValidationUI = () => {
    console.log("Validation failed for Tax ID.");
    setError(true);
  };

  const handleFieldChange = (value) => {
    if (!touched) {
      setTouched(true);  // Mark the field as touched when the user starts typing
    }

    if (error) {
      let validId = validateTaxId(value);
      if (validId) {
        setError(false);
      }
    }

    setTaxID(value);
  };

  // Validate the Tax ID to ensure it's exactly 11 digits long
  const validateTaxId = (value) => {
    return /^[0-9]{11}$/.test(value);  // Checks if it's 11 digits
  };

  const handleBlur = () => {
    // Trigger validation when the user leaves the field
    if (touched && !validateTaxId(taxID)) {
      setError(true);
    } else {
      // Apply the attribute change when validation passes and field is blurred
      applyAttributeChange({
        key: "TaxID",
        type: "updateAttribute",
        value: taxID,
      });
    }
  };

  // Render the UI
  return (
    <BlockStack border={"dotted"} padding={"tight"}>
      {/* Render the Tax ID field */}
      <TextField
        label={translate("taxIdLabel")}  // Translated label
        value={taxID}  
        error={touched && error ? translate("taxIdError") : false}  // Show error only if touched and invalid
        placeholder={translate("taxIdPlaceholder")}  // Translated placeholder
        onChange={handleFieldChange}
        onFocus={() => setTouched(true)}  // Set the field as touched when focused
        onBlur={handleBlur}  // Validate and save the tax ID when the user clicks away
      />

      {/* Translated text */}
      <Text size="small" appearance="subdued">
        {translate("taxIdExplanation")}  {/* Translated explanation */}
      </Text>
    </BlockStack>
  );
}
