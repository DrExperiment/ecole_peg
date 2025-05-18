import dynamic from "next/dynamic";
import Router, { useRouter } from "next/router";

export default function EditInscriptionPage({ params }: { params: { id: string; inscriptionId: string } }) {
    const router = useRouter();
    const { id, inscriptionId } = params;
}