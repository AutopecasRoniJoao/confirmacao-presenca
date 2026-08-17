// Função para exportar os dados do LocalStorage como arquivo JSON
function exportarBackup() {
  const dados = localStorage.getItem('presencas_db') || '[]';
  const dataFormatada = new Date().toISOString().slice(0, 10);
  const blob = new Blob([dados], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_presencas_${dataFormatada}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Função para importar arquivo JSON e atualizar o LocalStorage
function importarBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const conteudo = JSON.parse(e.target.result);
      if (Array.isArray(conteudo)) {
        if (confirm('Deseja substituir os dados atuais pelos dados do arquivo de backup?')) {
          localStorage.setItem('presencas_db', JSON.stringify(conteudo));
          alert('Backup importado com sucesso!');
          location.reload();
        }
      } else {
        alert('Formato de arquivo inválido. Certifique-se de usar um arquivo JSON válido.');
      }
    } catch (err) {
      alert('Erro ao ler o arquivo de backup.');
    }
  };
  reader.readAsText(file);
}
