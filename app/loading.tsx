import Loading from "@/components/Loading";
import React from "react";
import { Id, toast } from "react-toastify";

export const notify_success = (msg: string) => {
  return toast.success(msg, {
    position: toast.POSITION.TOP_RIGHT,
  });
};

export const notify_worning = (msg: string) => {
  return toast.warning(msg, {
    position: toast.POSITION.TOP_RIGHT,
  });
};

export const notify_error = (msg: string) => {
  return toast.error(msg, {
    position: toast.POSITION.TOP_RIGHT,
  });
};

export const notify_laoding = (msg: string) => {
  return toast.loading(msg, {
    position: toast.POSITION.TOP_CENTER,
    autoClose: 5000,
    toastId: msg,
  });
};
// export const notify_delete = () => {
//   toast.dismiss();
// =======
export const notify_delete = (msg?: Id) => {
  toast.dismiss(msg);
// >>>>>>> 6fe9b05b68af612c7dee16f52fe15c89396476cf
};

export default function loading() {
  return (
    <div>
      <Loading />
    </div>
  );
}
