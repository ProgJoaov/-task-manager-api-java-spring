package com.joaovitor.tarefas;

import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/tarefas")
public class TarefaController {
    private final List<Tarefa> tarefas = new ArrayList<>();
    private final AtomicLong contador = new AtomicLong(1);

    @GetMapping
    public List<Tarefa> listar() {
        return tarefas;
    }

    @PostMapping
    public Tarefa criar(@RequestBody TarefaRequest request) {
        Tarefa tarefa = new Tarefa(
                contador.getAndIncrement(),
                request.getTitulo(),
                false,
                request.getPrazo()
        );

        tarefas.add(tarefa);
        return tarefa;
    }

    @PutMapping("/{id}")
    public Tarefa editar(@PathVariable Long id, @RequestBody TarefaRequest request) {
        for (Tarefa tarefa : tarefas) {
            if (tarefa.getId().equals(id)) {
                tarefa.setTitulo(request.getTitulo());
                tarefa.setPrazo(request.getPrazo());
                return tarefa;
            }
        }

        throw new RuntimeException("Tarefa não encontrada");
    }

    @PatchMapping("/{id}/alternar")
    public Tarefa alternar(@PathVariable Long id) {
        for (Tarefa tarefa : tarefas) {
            if (tarefa.getId().equals(id)) {
                tarefa.setConcluida(!tarefa.isConcluida());
                return tarefa;
            }
        }

        throw new RuntimeException("Tarefa não encontrada");
    }

    @DeleteMapping("/{id}")
    public void remover(@PathVariable Long id) {
        tarefas.removeIf(tarefa -> tarefa.getId().equals(id));
    }
}