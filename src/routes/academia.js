// API REST dos estudantes
import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const nomeCollection = 'academia'
const { db, ObjectId } = await connectToDatabase()

/**********************************************
 * Validações
 * 
 **********************************************/
const validaCliente = [
  check('nome', 'Nome do Estudante é obrigatório').not().isEmpty(),
  check('plano', 'O tipo de ser Admin, Estudante ou Professor').isIn(['Mensal', 'Trimestral', 'Anual'])
  //check('anoGraduação', 'O ano de graduação deve estar entre 2021 e 2050').isInt({ min: 2021, max: 2050 }),
  //check('notaMédia', 'A nota média deve ser um número').isNumeric()
]


/**********************************************
 * GET /estudantes/
 * Lista todos os estudantes
 **********************************************/
router.get("/", async (req, res) => {
  try {
    db.collection(nomeCollection).find({}).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna os documentos
      }
    })
  } catch (err) {
    res.status(500).json({ "error": err.message })
  }
})

/**********************************************
 * GET /estudantes/:id
 * Lista o estudante através do id
 **********************************************/
router.get("/:id", async (req, res) => {
  try {
    db.collection(nomeCollection).find({ "_id": { $eq: ObjectId(req.params.id) } }).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna o documento
      }
    })
  } catch (err) {
    res.status(500).json({ "error": err.message })
  }
}) 

/**********************************************
 * GET /estudantes/nome/:nome
 * Lista o estudante através de parte do seu nome
 **********************************************/
router.get("/nome/:nome", async (req, res) => {
  try {
    db.collection(nomeCollection).find({ nome: {$regex: req.params.nome, $options: "i"} }).toArray((err, docs) => {
      if (err) {
        res.status(400).json(err) //bad request
      } else {
        res.status(200).json(docs) //retorna o documento
      }
    })
  } catch (err) {
    res.status(500).json({ "error": err.message })
  }
})

/**********************************************
 * POST /estudantes/
 * Inclui um novo estudante
 **********************************************/
router.post('/', validaCliente, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json(({
      errors: errors.array()
    }))
  } else {
    await db.collection(nomeCollection)
      .insertOne(req.body)
      .then(result => res.status(201).send(result)) //retorna o ID do documento inserido)
      .catch(err => res.status(400).json(err))
  }
})

/**********************************************
 * PUT /estudantes/
 * Alterar um estudante pelo ID
 **********************************************/
router.put('/', validaCliente, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json(({
      errors: errors.array()
    }))
  } else {
    const academiaInput = req.body
    await db.collection(nomeCollection)
      .updateOne({ "_id": { $eq: ObjectId(req.body._id) } }, {
        $set:
        {
          nome: academiaInput.nome,
          dataNascimento: academiaInput.dataNascimento,
          endereco: {
            logradouro: academiaInput.endereco.logradouro,
            bairro: academiaInput.endereco.bairro,
            numero: academiaInput.endereco.numero
          },
          plano: academiaInput.plano,
          instrutor: academiaInput.instrutor,
          dataInscricao: academiaInput.dataInscricao,
          dataVencimento: academiaInput.dataVencimento
        }
      },
        { returnNewDocument: true })
      .then(result => res.status(202).send(result))
      .catch(err => res.status(400).json(err))
  }
})

/**********************************************
 * DELETE /estudantes/
 * Apaga um estudante pelo ID
 **********************************************/
router.delete('/:id', async (req, res) => {
  await db.collection(nomeCollection)
    .deleteOne({ "_id": { $eq: ObjectId(req.params.id) } })
    .then(result => res.status(202).send(result))
    .catch(err => res.status(400).json(err))
})

export default router