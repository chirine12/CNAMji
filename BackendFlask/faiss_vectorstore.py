import os
import re
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.docstore.document import Document

# 📁 Dossier contenant le fichier texte
directory = 'data'

# 🧠 Embedding HuggingFace
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# 🔄 On traite un seul fichier .txt
for filename in os.listdir(directory):
    if filename.endswith('.txt'):
        code_name = filename.split('.')[0]  # ex: loi_2004_71

        with open(os.path.join(directory, filename), encoding='utf-8') as f:
            text = f.read()

        # ✅ Regex adaptée : "Article. 1." jusqu’à "Article. X." ou fin
        pattern = r"(Article\.\s*\d+\..*?)(?=Article\.\s*\d+\.|\Z)"
        matches = re.findall(pattern, text, re.DOTALL)

        # Nettoyage
        articles = [m.strip() for m in matches]

        if not articles:
            print(f"⚠️ Aucun article détecté dans {filename}. Vérifie la mise en forme.")
            continue

        print(f"✅ {len(articles)} articles trouvés dans {filename}")

        # 📚 Création des documents LangChain
        documents = [Document(page_content=article, metadata={"article_id": i + 1}) for i, article in enumerate(articles)]

        # 🔐 Création du vector store
        vectorstore = FAISS.from_documents(documents, embedding_model)

        # 💾 Sauvegarde
        os.makedirs("stores", exist_ok=True)
        output_path = f"stores/{code_name}"
        vectorstore.save_local(output_path)

        print(f"✅ Vector store FAISS pour '{code_name}' sauvegardé dans : {output_path}")
