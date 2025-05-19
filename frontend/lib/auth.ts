import axios from "axios";

export async function login(mot_de_passe: string) {
  try {
    await axios.post(
      "http://localhost:8000/api/auth/login/",
      { mot_de_passe },
      { withCredentials: true, headers: { "Content-Type": "application/json" } }
    );
  } catch (erreur) {
    throw new Error("La connexion a échoué");
  }
}

export async function logout() {
  await axios.post(
    "http://localhost:8000/api/auth/logout/",
    {},
    { withCredentials: true }
  );
}

export async function est_authentifie() {
  try {
    await axios.get(
      "http://localhost:8000/api/auth/est_authentifie/",
      { withCredentials: true }
    );

    return true;
  } catch (erreur) {
    return false;
  }
}
