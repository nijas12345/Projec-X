// alertUtils.ts
import Swal from 'sweetalert2';

export const showDeleteConfirmation = async (): Promise<boolean> => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel',
    reverseButtons: true,
  });

  return result.isConfirmed;
};

export const showProjectDeleteConfirmation = async (): Promise<boolean> => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This action delete the entire project details and task details.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel',
    reverseButtons: true,
  });

  return result.isConfirmed;
};


export const showProjectConfirmation = async (): Promise<boolean> => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This action re-assign and delete the task from you.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel',
    reverseButtons: true,
  });

  // Return whether the user confirmed or canceled
  return result.isConfirmed;
};

export const AssignByMeConfirmation = async (): Promise<boolean> => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This action assign this task to yourself.',
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Yes, Accept it!',
    cancelButtonText: 'No, cancel',
    reverseButtons: true,
  });

  // Return whether the user confirmed or canceled
  return result.isConfirmed;
};
