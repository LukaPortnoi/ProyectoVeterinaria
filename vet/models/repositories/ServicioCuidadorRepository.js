import path from 'path';
import { ServicioCuidadorModel } from '../schemas/servicioCuidadorSchema.js';

export class ServicioCuidadorRepository {
    constructor() {
        this.model = ServicioCuidadorModel
    }

    async countAll() {
        return await this.model.countDocuments()
    }

    async save(servicioCuidador) {
        if(servicioCuidador.id) {
            const { id, ...datosActualizados } = servicioCuidador
            const servicioCuidadorExistente = await this.model.findByIdAndUpdate(
                id,
                datosActualizados,
                { new: true , runValidators: true }
            )
            return await this.model.populate(servicioCuidadorExistente, [
                { path: 'usuarioProveedor'},
                { 
                    path: 'direccion.ciudad',
                    populate: { path: 'localidad' }
                }
            ])
        } else {
            const nuevoServicioCuidador = new this.model(servicioCuidador)
            const servicioCuidadorGuardado = await nuevoServicioCuidador.save()
            return await this.model.populate(servicioCuidadorGuardado, [
                { path: 'usuarioProveedor'},
                { 
                    path: 'direccion.ciudad',
                    populate: { path: 'localidad' }
                }
            ])
        }

    }

    async deleteById(id) {
        const resultado = await this.model.findByIdAndDelete(id)
        return resultado !== null
    }


    async findByPage(pageNum, limitNum){
        const skip = (pageNum - 1) * limitNum
        const servicioCuidador = await this.model.find()
            .skip(skip)
            .limit(limitNum)
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.ciudad',
                populate: {path: 'localidad'}
            })
        return servicioCuidador
    }

   async findByFilters(filtro) {
              
              const query = {}
      
              if(filtro.precioMax != null) {
                  query.precio = {}
                  query.precio.$lte = filtro.precioMax
              }
              
              if(filtro.precioMin != null) {
                  query.precio.$gte = filtro.precioMin
              }
      
              /* if(filtro.antiguedad != null) {
                  query.cantHuespedesMax = { $gte: filtro.antiguedad}
              } */
      
              if(filtro.mascotasAceptadas && filtro.mascotasAceptadas.length > 0) {
                  query.mascotasAceptadas = { $all: filtro.mascotasAceptadas }
              }
      
              if (filtro.fechaInicio && filtro.fechaFin) {
                  const fechaInicioDate = parseFechaDDMMYYYY(filtro.fechaInicio);
                  const fechaFinDate = parseFechaDDMMYYYY(filtro.fechaFin);
      
                  query.fechasNoDisponibles = {
                      $not: {
                          $elemMatch: {
                              fechaInicio: { $lte: fechaFinDate },
                              fechaFin: { $gte: fechaInicioDate }
                          }
                      }
                  };
              }
      
      
              const resultadosFiltro1 = await this.model.find(query)
                  .populate('usuarioProveedor')
                  .populate({
                      path: 'direccion.ciudad',
                      populate: {path: 'localidad'}
                  })
      
              return resultadosFiltro1.filter(r => {
                  const ciudad = r.direccion?.ciudad
                  const localidad = ciudad?.localidad
                  const nombreServicio = r.nombreServicio
      
                  const coincideCiudad = filtro.ciudad ? ciudad?.nombre === filtro.ciudad : true
                  const coincideLocalidad = filtro.localidad ? pais?.nombre === filtro.localidad : true
                   const coincideNombreServicio = filtro.nombre ? nombreServicio === filtro.nombreServicio : true
   
      
                  return coincideCiudad && coincideLocalidad && coincideNombreServicio
              })
      
          }

    async findById(id) {
        return await this.model.findById(id)
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.ciudad',
                populate: {path: 'localidad'}
            })
    }

    async findByAnfitrion(anfitrionID) {
        return await this.model.find({ usuarioProveedor: anfitrionID })
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.ciudad',
                populate: {path: 'localidad'}
            })
    }

    async findByName(nombre) {
        return await this.model.findOne({nombre})
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.ciudad',
                populate: {path: 'localidad'}
            })
    }

    async findAll() {
        return await this.model.find()
            .populate('usuarioProveedor')
            .populate({
                path: 'direccion.ciudad',
                populate: {path: 'localidad'}
            })
    }
}



function parseFechaDDMMYYYY(fechaStr) {
  const [dia, mes, anio] = fechaStr.split("/");
  return new Date(`${anio}-${mes}-${dia}T00:00:00`);
}
