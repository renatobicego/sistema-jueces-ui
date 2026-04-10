"use client";
import { useState } from "react";
import {
  Button,
  Modal,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalFooter,
  useOverlayState,
  toast,
} from "@heroui/react";
import { juecesApi } from "@/lib/axios";
import CustomInput from "@/components/atoms/CustomInput";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import type { RegistrarAtletaModalProps } from "@/types";

export default function RegistrarAtletaModal({
  torneoId,
  pruebaId,
  categoriaId,
  onSuccess,
}: RegistrarAtletaModalProps) {
  const state = useOverlayState();
  const [dni, setDni] = useState("");
  const [found, setFound] = useState<{
    nombre_apellido: string;
    pais: string;
    sexo: string;
  } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({
    nombre_apellido: "",
    sexo: "M",
    pais: "ARG",
    fecha_nacimiento: "",
  });
  const [loading, setLoading] = useState(false);

  const handleBuscar = async () => {
    setLoading(true);
    setFound(null);
    setNotFound(false);
    try {
      const { data } = await juecesApi.get(
        `/jueces/torneo/${torneoId}/atleta/dni/${dni.trim()}`,
      );
      setFound(data.atleta);
    } catch (e: unknown) {
      const err = e as {
        response?: { status?: number; data?: { error?: string } };
      };
      if (err.response?.status === 404) setNotFound(true);
      else toast.danger(err.response?.data?.error ?? "Error al buscar.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrar = async () => {
    setLoading(true);
    try {
      await juecesApi.post(`/jueces/torneo/${torneoId}/atleta/registrar`, {
        dni: dni.trim(),
        categoriaId,
        pruebaId,
        ...(notFound ? form : {}),
      });
      onSuccess();
      state.close();
      setDni("");
      setFound(null);
      setNotFound(false);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      toast.danger(err.response?.data?.error ?? "Error al registrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="secondary" onPress={state.open}>
        + Registrar atleta
      </Button>

      <Modal state={state}>
        <ModalBackdrop isDismissable />
        <ModalContainer size="md">
          <ModalDialog>
            <ModalHeader>
              <ModalHeading>Registrar atleta en esta prueba</ModalHeading>
            </ModalHeader>
            <ModalBody className="space-y-4">
              <div className="flex gap-2">
                <CustomInput
                  label="DNI"
                  value={dni}
                  onValueChange={setDni}
                  placeholder="12345678"
                  className="flex-1"
                />
                <SubmitButton
                  type="button"
                  variant="secondary"
                  submitting={loading}
                  fullWidth={false}
                  onPress={handleBuscar}
                  className="self-end"
                >
                  Buscar
                </SubmitButton>
              </div>

              {found && (
                <div className="bg-success-50 p-3 rounded text-sm">
                  <p className="font-medium text-success-700">
                    {found.nombre_apellido}
                  </p>
                  <p className="text-success-600">
                    {found.pais} — {found.sexo}
                  </p>
                </div>
              )}

              {notFound && (
                <>
                  <hr className="border-slate-200" />
                  <p className="text-slate-500 text-sm">
                    Atleta no encontrado. Completá los datos:
                  </p>
                  <CustomInput
                    label="Nombre y apellido"
                    value={form.nombre_apellido}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, nombre_apellido: v }))
                    }
                    required
                  />
                  <div className="gap-3 grid grid-cols-2">
                    <CustomSelect
                      label="Sexo"
                      value={form.sexo}
                      onChange={(v) => setForm((f) => ({ ...f, sexo: v }))}
                      items={[
                        { key: "M", label: "Masculino", value: "M" },
                        { key: "F", label: "Femenino", value: "F" },
                      ]}
                    />
                    <CustomInput
                      label="País"
                      value={form.pais}
                      onValueChange={(v) => setForm((f) => ({ ...f, pais: v }))}
                    />
                  </div>
                  <CustomInput
                    label="Fecha de nacimiento"
                    type="date"
                    value={form.fecha_nacimiento}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, fecha_nacimiento: v }))
                    }
                    required
                  />
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onPress={state.close}>
                Cancelar
              </Button>
              {(found || notFound) && (
                <SubmitButton
                  type="button"
                  variant="primary"
                  submitting={loading}
                  fullWidth={false}
                  onPress={handleRegistrar}
                >
                  Inscribir en esta prueba
                </SubmitButton>
              )}
            </ModalFooter>
          </ModalDialog>
        </ModalContainer>
      </Modal>
    </>
  );
}
