export const cardStyle =
  "px-5 !py-3 rounded-md text-textColor bg-white text-xs sm:text-sm";

export const inputStyle = `
  block 
  flex-1 
  border 
  border-black/60 
  bg-transparent 
  px-8 
  py-1
  text-gray-500
  placeholder:text-gray-150/5
  placeholder:translate-y-4
  placeholder:pl-0.5
  outline-none 
  text-xs 
  sm:text-sm 
  sm:leading-6 
  rounded-md 
  shadow-[0_1px_2px_0px_rgba(0,0,0,0.05)]
  ring-1 
  ring-inset 
  ring-gray-300 
  focus:ring-2 
  focus:ring-inset 
  focus:ring-indigo-600
`;

export const inputMuiFontSize = {
  width: "100%",
  "& .MuiInputLabel-root": {
    fontSize: 13,
  },
  "& .MuiInputBase-input": {
    fontSize: 13,
  },
  lineHeight: 2,
};
