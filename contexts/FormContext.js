"use client";

import { useState } from "react";

const { createContext } = require("react");

export const FormContext = createContext({});

export default function Form({ children }) {
  const [formData, setFormData] = useState({
    UserName: "",
    TwitterProfile: "",
    EmailAddress: "",
    NexusType: "",
  });

  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormContext.Provider>
  );
}
