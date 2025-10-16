// src/lib/toast.js
import { toast } from "react-toastify";

export const toastSuccess = () => toast.success("İşlem başarılı");
export const toastError = () => toast.error("İşlem başarısız");
