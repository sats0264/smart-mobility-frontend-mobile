/**
 * Service API pour Smart Mobility
 * Centralise les appels vers les microservices Spring Boot
 */

const BASE_URL = 'http://192.168.1.100'; // Remplacez par votre IP locale ou domaine

const ENDPOINTS = {
    AUTH: `${BASE_URL}:8080/auth`,
    USER_PASS: `${BASE_URL}:8080/api/users`,
    TRIP_MGMT: `${BASE_URL}:8081/api/trips`,
    PRICING: `${BASE_URL}:8082/api/pricing`,
};

export const apiClient = async (url: string, options: RequestInit = {}) => {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Une erreur est survenue');
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error [${url}]:`, error);
        throw error;
    }
};

// --- SERVICES SPECIFIQUES ---

export const JourneyService = {
    // Détecter si un trajet est déjà en cours au démarrage
    getActiveJourney: async (userId: string) => {
        return apiClient(`${ENDPOINTS.TRIP_MGMT}/active/${userId}`);
    },

    // Check-in : Scan QR Code au début
    checkIn: async (userId: string, transportType: string, stationId: string) => {
        return apiClient(`${ENDPOINTS.TRIP_MGMT}/check-in`, {
            method: 'POST',
            body: JSON.stringify({ userId, transportType, stationId }),
        });
    },

    // Check-out : Scan QR Code à la fin
    checkOut: async (tripId: string, stationId: string) => {
        return apiClient(`${ENDPOINTS.TRIP_MGMT}/check-out`, {
            method: 'POST',
            body: JSON.stringify({ tripId, stationId }),
        });
    }
};

export const UserService = {
    // Récupérer le solde et les infos utilisateur
    getProfile: async (userId: string) => {
        return apiClient(`${ENDPOINTS.USER_PASS}/${userId}`);
    },

    // Recharger le compte / Renouveler abonnement
    renewPass: async (userId: string, packageId: string, paymentMethod: string) => {
        return apiClient(`${ENDPOINTS.USER_PASS}/renew`, {
            method: 'POST',
            body: JSON.stringify({ userId, packageId, paymentMethod }),
        });
    }
};
