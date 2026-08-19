/**
 * Calculates the age in completed years based on the provided date of birth.
 * Also validates if the date is in the future.
 * 
 * @param {string | Date} dob - The date of birth
 * @returns {object} { age: number | '', error: string | null }
 */
export const calculateAge = (dob) => {
    if (!dob) {
        return { age: '', error: null };
    }

    const dobDate = new Date(dob);
    const today = new Date();

    if (dobDate > today) {
        return { age: '', error: 'Date of Birth cannot be in the future.' };
    }

    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDifference = today.getMonth() - dobDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dobDate.getDate())) {
        age--;
    }

    if (age < 0) {
        return { age: '', error: 'Age cannot be negative.' };
    }

    return { age: age, error: null };
};
