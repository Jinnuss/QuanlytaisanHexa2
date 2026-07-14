import Swal from "sweetalert2";

const commonConfig = {
  customClass: {
    popup: "hexa-alert-popup",
    title: "hexa-alert-title",
    confirmButton: "hexa-alert-confirm",
    cancelButton: "hexa-alert-cancel",
  },
  buttonsStyling: false,
};

export const showSuccess = (
  title,
  text = ""
) => {
  return Swal.fire({
    ...commonConfig,
    icon: "success",
    title,
    text,
    confirmButtonText: "Đóng",
  });
};

export const showError = (
  title,
  text = ""
) => {
  return Swal.fire({
    ...commonConfig,
    icon: "error",
    title,
    text,
    confirmButtonText: "Đóng",
  });
};

export const showWarning = (
  title,
  text = ""
) => {
  return Swal.fire({
    ...commonConfig,
    icon: "warning",
    title,
    text,
    confirmButtonText: "Đóng",
  });
};

export const showConfirm = ({
  title,
  text = "",
  confirmText = "Đồng ý",
  cancelText = "Hủy",
  icon = "question",
  danger = false,
}) => {
  return Swal.fire({
    ...commonConfig,
    icon,
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    customClass: {
      ...commonConfig.customClass,
      confirmButton: danger
        ? "hexa-alert-confirm hexa-alert-danger"
        : "hexa-alert-confirm",
    },
  });
};

export const showToast = (
  icon,
  title
) => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
    customClass: {
      popup: "hexa-toast",
    },
  });
};

export const showLoading = (
  title = "Đang xử lý..."
) => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
    customClass: {
      popup: "hexa-alert-popup",
      title: "hexa-alert-title",
    },
  });
};

export const closeAlert = () => {
  Swal.close();
};