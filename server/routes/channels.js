const express = require('express');
const Server = require('../models/Server');
const auth = require('../middleware/auth');

const router = express.Router();

// Criar canal
router.post('/:serverId', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.serverId);
    
    if (!server) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    // Verificar permissão
    const member = server.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return res.status(403).json({ error: 'Sem permissão para criar canais' });
    }

    const { name, type, maxUsers, isPrivate, allowedUsers } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });
    }

    const newChannel = {
      name: name.trim(),
      type,
      position: server.channels.length,
      voiceSettings: type === 'voice' ? {
        maxUsers: maxUsers || 0,
        isPrivate: isPrivate || false,
        allowedUsers: allowedUsers || []
      } : undefined
    };

    server.channels.push(newChannel);
    await server.save();

    res.status(201).json({ channel: server.channels[server.channels.length - 1], server });
  } catch (error) {
    console.error('Erro ao criar canal:', error);
    res.status(500).json({ error: 'Erro ao criar canal' });
  }
});

// Atualizar canal
router.put('/:serverId/:channelId', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.serverId);
    
    if (!server) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    // Verificar permissão
    const member = server.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const channel = server.channels.id(req.params.channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Canal não encontrado' });
    }

    const { name, maxUsers, isPrivate, allowedUsers } = req.body;
    if (name) channel.name = name.trim();
    
    if (channel.type === 'voice') {
      if (maxUsers !== undefined) channel.voiceSettings.maxUsers = maxUsers;
      if (isPrivate !== undefined) channel.voiceSettings.isPrivate = isPrivate;
      if (allowedUsers) channel.voiceSettings.allowedUsers = allowedUsers;
    }

    await server.save();
    res.json({ channel, server });
  } catch (error) {
    console.error('Erro ao atualizar canal:', error);
    res.status(500).json({ error: 'Erro ao atualizar canal' });
  }
});

// Deletar canal
router.delete('/:serverId/:channelId', auth, async (req, res) => {
  try {
    const server = await Server.findById(req.params.serverId);
    
    if (!server) {
      return res.status(404).json({ error: 'Servidor não encontrado' });
    }

    // Verificar permissão
    const member = server.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    server.channels.pull(req.params.channelId);
    await server.save();

    res.json({ message: 'Canal deletado com sucesso', server });
  } catch (error) {
    console.error('Erro ao deletar canal:', error);
    res.status(500).json({ error: 'Erro ao deletar canal' });
  }
});

module.exports = router;

