export class ClienteController {
  /* constructor(clienteService, reservaService) {
    this.clienteService = clienteService
    this.reservaService = reservaService
  } */

    constructor(clienteService) {
    this.clienteService = clienteService
    
  }

  async findAll(req, res, next) {
    try {
      const { page, limit } = req.query;
      const cliente = await this.clienteService.findAll({ page, limit });

      res.json(cliente);
    } catch (error) {
      next(error);
    }
  }

  async logIn(req, res, next) {
    try {
      const datos = req.body
      const usuario = await this.clienteService.logIn(datos)

      res.json(usuario)
    } catch (error) {
      next(error)
    }
  }

  async create(req, res, next) {
    try {
      const cliente = req.body;
      const nuevo = await this.clienteService.create(cliente);

      res.status(201).json(nuevo);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.clienteService.delete(req.params.id);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const id = req.params.id;
      const { nombreUsuario, email } = req.body;

      const actualizado = await this.clienteService.update(id, { nombreUsuario, email });

      res.json(actualizado);
    } catch (error) {
      next(error);
    }
  }

async marcarLeidaNotificacion(req, res, next) {
    try {
      const { id, idNotificacion} = req.params

      const actualizado = await this.clienteService.updateNotificacionLeida(id, idNotificacion);

      res.json(actualizado);
    } catch (error) {
      next(error);
    }
  }

  /* async updateReserva(req, res, next) {
    try {
      const { id, idNotificacion} = req.params

      const nuevaReserva = await this.reservaService.update(id, idNotificacion)

      res.json(nuevaReserva)
    } catch(error) {
      next(error)
    }
  }
 
  async cancelReserva(req, res, next) {
    try {
      const { id, idReserva} = req.params

      const motivo = req.body && req.body.motivo ? req.body.motivo : null;
  
      await this.reservaService.modificarEstado(id, idReserva, "CANCELADA", motivo);

      return res.status(200).send();
    } catch(error) {
      next(error)
    }
  } */

  async getNotificaciones(req, res, next) {
    try {
      const { id, tipoLeida } = req.params
      const { page, limit } = req.query

      const notificaciones = await this.clienteService.getNotificaciones(id, tipoLeida, page, limit)

      res.json(notificaciones)
    } catch(error) {
      next(error)
    }
  }

    async findMascotasByCliente(req, res, next) {
        try {
        const id = req.params.id
        const mascotas = await this.clienteService.getMascotas(id)
    
        res.json(mascotas)
        } catch (error) {
        next(error)
        }
    }

    async addMascota(req, res, next) {
        try {
        const id = req.params.id
        const mascota = req.body
    
        const nuevaMascota = await this.clienteService.addMascotaCreada(id, mascota)
    
        res.status(201).json(nuevaMascota);
        } catch (error) {
        next(error)
        }
    }

    async deleteMascota(req, res, next) {
        try {
        const id = req.params.id
        const idMascota = req.params.idMascota
    
        await this.clienteService.eliminarMascota(id, idMascota)

        return res.status(204).send();

        } catch (error) {
        next(error)
        }
    }
}
