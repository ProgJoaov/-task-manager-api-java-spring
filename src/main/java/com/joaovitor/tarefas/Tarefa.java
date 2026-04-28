package com.joaovitor.tarefas;

public class Tarefa {
    private Long id;
    private String titulo;
    private boolean concluida;
    private String prazo;

    public Tarefa(Long id, String titulo, boolean concluida, String prazo) {
        this.id = id;
        this.titulo = titulo;
        this.concluida = concluida;
        this.prazo = prazo;
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public boolean isConcluida() {
        return concluida;
    }

    public String getPrazo() {
        return prazo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public void setConcluida(boolean concluida) {
        this.concluida = concluida;
    }

    public void setPrazo(String prazo) {
        this.prazo = prazo;
    }
}
