// Declaraciones de tipos para api.js

export interface FiltrosAlojamiento {
  [key: string]: any;
}

export interface DatosLogin {
  email: string;
  contrasenia: string;
}

export interface DatosRegistro {
  nombreUsuario: string;
  email: string;
  contrasenia: string;
  telefono: string;
  direccion: {
    calle: string;
    altura: string;
    localidad: {
      nombre: string;
      ciudad: {
        nombre: string;
      }
    }
  };
}

export interface DatosReserva {
  reservador: string;
  cantHuespedes: number;
  alojamiento: string;
  rangoFechas: any;
}

export interface DatosAlojamiento {
  anfitrion: string;
  nombre: string;
  descripcion: string;
  precioPorNoche: number;
  moneda: string;
  horarioCheckIn: string;
  horarioCheckOut: string;
  direccion: string;
  cantHuespedesMax: number;
  caracteristicas: string[];
  fotos: string[];
}

export interface DatosMascota {
  nombre: string;
  tipo: string;
  raza?: string | null;
  edad?: number | null;
  peso?: number | null;
  fotos: string[];
}

export interface DatosServicioVeterinario {
  idVeterinaria: string;
  nombreServicio: string;
  tipoServicio: string;
  duracionMinutos: number;
  precio: number;
  descripcion: string;
  nombreClinica: string;
  emailClinica: string;
  telefonoClinica: string;
  diasDisponibles: string[];
  horariosDisponibles: string[];
  mascotasAceptadas: string[];
  direccion: {
    calle: string;
    altura: number;
    localidad: {
      nombre: string;
      ciudad: {
        nombre: string;
      };
    };
  };
}

export declare function getAlojamientos(pageNumber: number, filtros: FiltrosAlojamiento): Promise<any>;
export declare function getDestinos(pageNumber: number): Promise<any>;
export declare function loginUsuario(datos: DatosLogin, tipo: string): Promise<any>;
export declare function signinUsuario(datos: DatosRegistro, tipo: string): Promise<any>;
export declare function registrarMascota(usuarioId: string, datosMascota: DatosMascota): Promise<any>;
export declare function crearServiciooVeterinaria(data: DatosServicioVeterinario): Promise<any>;
export declare function reservarAlojamiento(datos: DatosReserva): Promise<any>;
export declare function getReservasHuesped(usuarioId: string, page: number): Promise<any>;
export declare function getAlojamientosAnfitrion(id: string, page?: number): Promise<any>;
export declare function getReservasAnfitrion(anfitrionId: string, page: number): Promise<any>;
export declare function confirmarReserva(anfitrionId: string, reservaId: string): Promise<void>;
export declare function cancelarReserva(huespedId: string, reservaId: string): Promise<void>;
export declare function getNotificacionesHuesped(usuarioId: string, leida: string, pageNumber: number): Promise<any>;
export declare function getNotificacionesAnfitrion(usuarioId: string, leida: string, pageNumber: number): Promise<any>;
export declare function marcarLeidaHuesped(usuarioId: string, notificacionId: string): Promise<void>;
export declare function marcarLeidaAnfitrion(usuarioId: string, notificacionId: string): Promise<void>;
export declare function crearAlojamiento(data: DatosAlojamiento): Promise<any>;
export declare function registrarMascota(clienteId: string, mascotaData: DatosMascota): Promise<any>;
