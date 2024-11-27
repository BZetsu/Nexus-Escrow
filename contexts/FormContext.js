"use client";

import React, { createContext, useContext, useState } from 'react';

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
