import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
import os

# Try to import sentence_transformers, but make it optional
try:
    from sentence_transformers import SentenceTransformer
    BERT_AVAILABLE = True
except (ImportError, OSError) as e:
    BERT_AVAILABLE = False
    print(f"Warning: sentence-transformers not available due to: {e}. BERT embeddings will be disabled.")

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Initialize stopwords
STOP = set(stopwords.words("english"))

def normalize(text: str) -> str:
    """Normalize text by lowercasing and removing punctuation"""
    t = text.lower()
    t = re.sub(r"[^\w\s]", " ", t)        # remove punctuation
    t = re.sub(r"\s+", " ", t).strip()
    return t

def tokenize_and_clean(text: str) -> list:
    """Tokenize and clean text by removing stopwords and short tokens"""
    text = normalize(text)
    tokens = word_tokenize(text)
    tokens = [t for t in tokens if t not in STOP and len(t) > 1]
    return tokens

# TF-IDF: fit a vectorizer on project corpus (or use incremental)
tfidf_vectorizer = TfidfVectorizer(tokenizer=tokenize_and_clean, max_features=2000)

# BERT embeddings (sentence-transformers)
bert_model = None
if BERT_AVAILABLE:
    try:
        bert_model = SentenceTransformer("all-MiniLM-L6-v2")   # fast, good for demos
    except Exception as e:
        BERT_AVAILABLE = False
        print(f"Warning: Failed to initialize BERT model: {e}")

def get_bert_embedding(text):
    """Get BERT embedding for text using SentenceTransformer"""
    if not BERT_AVAILABLE or bert_model is None:
        # Return a zero vector of the same size as expected
        return [0.0] * 384  # all-MiniLM-L6-v2 produces 384-dimensional vectors
    
    text = normalize(text)
    vec = bert_model.encode(text).tolist()
    return vec

def get_tfidf_embedding(text, fit_vectorizer=False):
    """Get TF-IDF embedding for text"""
    if fit_vectorizer:
        # Fit the vectorizer on the text itself (for demo purposes)
        tfidf_vectorizer.fit([text])
    
    # Transform the text to TF-IDF vector
    vector = tfidf_vectorizer.transform([text]).toarray()[0].tolist()
    return vector