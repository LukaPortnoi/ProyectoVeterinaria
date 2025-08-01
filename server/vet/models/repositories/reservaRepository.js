import path from "path"
import { ReservaModel } from "../schemas/reservaSchema.js"

export class ReservaRepository {
    constructor() {
        this.model = ReservaModel
    }

    async save(reserva) {
        const { id, ...datos } = reserva;

        let reservaGuardada;

        if (id) {
            // Actualiza si existe
            reservaGuardada = await this.model.findByIdAndUpdate(
            id,
            datos,
            { new: true, runValidators: true }
            );
        } else {
            // Crea nueva si no existe
            const nuevaReserva = new this.model(reserva);
            reservaGuardada = await nuevaReserva.save();
        }

        // Primero: populate cliente y servicioReservado (con refPath)
        reservaGuardada = await this.model.populate(reservaGuardada, [
            { path: 'cliente' },
            { path: 'servicioReservado' }
        ]);

        // Segundo: populate anidado sobre servicioReservado (ANTES de convertir a objeto)
        if (reservaGuardada.servicioReservado) {
            reservaGuardada.servicioReservado = await reservaGuardada.servicioReservado.populate([
            { path: 'usuarioProveedor' },
            {
                path: 'direccion.localidad',
                populate: { path: 'ciudad' }
            }
            ]);
        }

        // Buscar la mascota dentro del cliente y convertir a objeto plano
        if (reservaGuardada.cliente && reservaGuardada.cliente.mascotas) {
            const mascota = reservaGuardada.cliente.mascotas.find(m => m._id.toString() === reservaGuardada.mascota.toString());
            if (mascota) {
                // Convertir a objeto plano y asignar la mascota
                const reservaObj = reservaGuardada.toObject();
                reservaObj.mascota = mascota;
                reservaGuardada = reservaObj;
            }
        }

        return reservaGuardada;
    }

    async deleteById(id) {
        const resultado = await this.model.findByIdAndDelete(id)
        return resultado !== null
    }

    async findById(id) {
        let reserva = await this.model.findById(id)
            .populate('cliente')
            .populate('servicioReservado'); // refPath lo resuelve automáticamente

        if (!reserva) return null;

        // Buscar la mascota dentro del cliente
        if (reserva.cliente && reserva.cliente.mascotas) {
            const mascota = reserva.cliente.mascotas.find(m => m._id.toString() === reserva.mascota.toString());
            if (mascota) {
                // Convertir a objeto plano y asignar la mascota
                const reservaObj = reserva.toObject();
                reservaObj.mascota = mascota;
                reserva = reservaObj;
            }
        }

        // Segundo nivel de populate sobre servicioReservado
        if (reserva.servicioReservado) {
            // Necesitamos trabajar con el documento original para el populate
            const reservaDoc = await this.model.findById(id).populate('servicioReservado');
            reservaDoc.servicioReservado = await reservaDoc.servicioReservado.populate([
            { path: 'usuarioProveedor' },
            {
                path: 'direccion.localidad',
                populate: { path: 'ciudad' }
            }
            ]);
            
            // Asignar el servicioReservado populado al objeto resultado
            reserva.servicioReservado = reservaDoc.servicioReservado;
        }

        return reserva;
    }

    async findByUsuarioProveedor(serviciosReservadosIds) {
        if (!Array.isArray(serviciosReservadosIds) || serviciosReservadosIds.length === 0) {
            return [];
        }

        const reservas = await this.model.find({
            servicioReservado: { $in: serviciosReservadosIds }
        })
        .populate('cliente')
        .populate({
            path: 'servicioReservado',
            populate: [
            { path: 'usuarioProveedor' },
            {
                path: 'direccion.localidad',
                populate: { path: 'ciudad' }
            }
            ]
        });

        // Para cada reserva, buscar la mascota dentro del cliente
        return reservas.map(reserva => {
            // Convertir el documento de Mongoose a objeto JS plano
            const reservaObj = reserva.toObject();
            
            if (reserva.cliente && reserva.cliente.mascotas) {
                const mascota = reserva.cliente.mascotas.find(m => m._id.toString() === reserva.mascota.toString());
                if (mascota) {
                    reservaObj.mascota = mascota;
                }
            }
            return reservaObj;
        });
    }

    async findByUsuarioProveedorByPage(pageNum, limitNum, serviciosReservadosIds) {

        const skip = (pageNum - 1) * limitNum;

        if (!Array.isArray(serviciosReservadosIds) || serviciosReservadosIds.length === 0) {
            return [];
        }
        
        const reservas = await this.model.find({
            servicioReservado: { $in: serviciosReservadosIds }
        })
        .skip(skip)
        .limit(limitNum)
        .populate('cliente')
        .populate({
            path: 'servicioReservado',
            populate: [
            { path: 'usuarioProveedor' },
            {
                path: 'direccion.localidad',
                populate: { path: 'ciudad' }
            }
            ]
        });

        // Para cada reserva, buscar la mascota dentro del cliente
        return reservas.map(reserva => {
            // Convertir el documento de Mongoose a objeto JS plano
            const reservaObj = reserva.toObject();
            
            if (reserva.cliente && reserva.cliente.mascotas) {
                const mascota = reserva.cliente.mascotas.find(m => m._id.toString() === reserva.mascota.toString());
                if (mascota) {
                    reservaObj.mascota = mascota;
                }
            }
            return reservaObj;
        });
    }


    // ESTE LO HICE POR LAS DUDAS
    async findByServicioReservado(servicioReservado) {
    const reservas = await this.model.find({ servicioReservado })
        .populate('cliente')
        .populate({
            path: 'servicioReservado',
            populate: [
                { path: 'usuarioProveedor' },
                {
                    path: 'direccion.localidad',
                    populate: { path: 'ciudad' }
                }
            ]
        });

    // Para cada reserva, buscar la mascota dentro del cliente
    return reservas.map(reserva => {
        // Convertir el documento de Mongoose a objeto JS plano
        const reservaObj = reserva.toObject();
        
        if (reserva.cliente && reserva.cliente.mascotas) {
            const mascota = reserva.cliente.mascotas.find(m => m._id.toString() === reserva.mascota.toString());
            if (mascota) {
                reservaObj.mascota = mascota;
            }
        }
        return reservaObj;
    });
}

    async findByCliente(pageNum, limitNum, cliente) {
        const skip = (pageNum - 1) * limitNum;

        let reservas = await this.model.find({ cliente })
            .skip(skip)
            .limit(limitNum)
            .populate('cliente')
            .populate({
                path: 'servicioReservado',
                populate: [
                    { path: 'usuarioProveedor' },
                    {
                        path: 'direccion.localidad',
                        populate: { path: 'ciudad' }
                    }
                ]
            });

        // Para cada reserva, buscar la mascota dentro del cliente
        reservas = reservas.map(reserva => {
            // Convertir el documento de Mongoose a objeto JS plano
            const reservaObj = reserva.toObject();
            
            if (reserva.cliente && reserva.cliente.mascotas) {
                const mascota = reserva.cliente.mascotas.find(m => m._id.toString() === reserva.mascota.toString());
                if (mascota) {
                    reservaObj.mascota = mascota;
                }
            }
            return reservaObj;
        });

        return reservas;
        }


    async findAll() {
        let reservas = await this.model.find()
            .populate('cliente')
            .populate({
            path: 'servicioReservado',
            populate: [
                { path: 'usuarioProveedor' },
                {
                path: 'direccion.localidad',
                populate: { path: 'ciudad' }
                }
            ]
            });

        // Para cada reserva, buscar la mascota dentro del cliente
        reservas = reservas.map(reserva => {
            // Convertir el documento de Mongoose a objeto JS plano
            const reservaObj = reserva.toObject();
            
            if (reserva.cliente && reserva.cliente.mascotas) {
                const mascota = reserva.cliente.mascotas.find(m => m._id.toString() === reserva.mascota.toString());
                if (mascota) {
                    reservaObj.mascota = mascota;
                }
            }
            return reservaObj;
        });

        return reservas;
    }


    

    
    async countAll() {
        return await this.model.countDocuments()
    }
}
